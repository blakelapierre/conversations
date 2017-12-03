import { h, render } from 'preact-cycle';

import server from './server';

import {
  Conversation,
  CHAT_CHANNEL, CHAT_CHANNEL_NAME,
  ISSUES_CHANNEL, ISSUES_CHANNEL_NAME,
  GAME_CHANNEL, GAME_CHANNEL_NAME,
  TIME_CHANNEL, TIME_CHANNEL_NAME
} from './conversation';

import {Console, ADD_LOG_MESSAGE} from './console';

const state = getState();

function getState() {
  let savedState = localStorage.getItem('savedState');

  if (!savedState) {
    savedState = {currentId: new Uint8Array(64), partners: {}};
    window.crypto.getRandomValues(savedState.currentId);
    saveState(savedState);
  }
  else {
    savedState = JSON.parse(savedState, (k, v) => {
      if (k === 'currentId') return new Uint8Array(v);
      return v;
    });
  }

  const state = {
    status: {
      started: false
    },
    signaler: {
      currentId: savedState.currentId,
      status: 'Not Connected'
    },
    partners: savedState.partners,
    input: {
      connectTo: undefined,
      message: undefined
    },
    conversations: {},
    log: []
  };

  return state;
}

function saveState(state) {
  localStorage.setItem('savedState', stringifyState(state));
}


let connectTo;
const START = (_, mutation) => {
  mutation(STARTED)();

  connectTo = server(_.signaler.currentId, createActions(mutation));
};


function createActions(mutation) {
  // jshint ignore:start
  const {
    SIGNAL_CONNECTION_STATE_CHANGE,
    PARTNER_MESSAGE,

    ICE_CONNECTION_STATE_CHANGE,
    ICE_GATHERING_STATE_CHANGE
  } = {
    SIGNAL_CONNECTION_STATE_CHANGE: (_, state) => {
      _.signaler.connectionState = state;
    },

    PARTNER_MESSAGE: (_, [partnerId, message]) => {
      const id = partnerId.toString();

      let context = _.partners[id];

      console.log('context', context);

      if (context === undefined) {
        context = _.partners[id] = {
          id,
          discoveredAt: new Date().getTime()
        };

        saveState({currentId: _.signaler.currentId, partners: _.partners});
      }

      if (!_.conversations[id]) {
        _.conversations[id] = (_.conversations[id] || {partner: partnerId, context, channels: {}});
      }

      ADD_LOG_MESSAGE(_, `${renderShortID(partnerId)}: ${JSON.stringify(message)}`);
    },

    ICE_CONNECTION_STATE_CHANGE: (_, partner, iceConnectionState) => {
      const id = partner.toString(),
            context = _.partners[id];

      if (iceConnectionState === 'connected') {
        (context.connectedAt = context.connectedAt || []).unshift(new Date().getTime());
      }
      else if (iceConnectionState === 'closed') {
        context.closedAt = new Date().getTime();
      }
      else if (iceConnectionState === 'disconnected') {
        (context.disconnectedAt = context.disconnectedAt || []).unshift(new Date().getTime());
      }

      console.log(context);

      context.iceConnectionState = iceConnectionState;
    },

    ICE_GATHERING_STATE_CHANGE: (_, partner, iceGatheringState) => {
      const id = partner.toString(),
            context = _.partners[id];

      context.iceGatheringState = iceGatheringState;
    }
  };
  // jshint ignore:end

  return actionize({
    'signal': {
      'connection-state': [SIGNAL_CONNECTION_STATE_CHANGE],
      'partner-message': [PARTNER_MESSAGE]
    },
    'peer': {
      'connection-state': [(_, connectionState) => {console.log('***', connectionState);}],
      'ice-connection-state': [ICE_CONNECTION_STATE_CHANGE],
      'ice-gathering-state': [ICE_GATHERING_STATE_CHANGE],
      'chat-channel-open': [CHAT_CHANNEL, mutation],
      'issues-channel-open': [ISSUES_CHANNEL, mutation],
      'time-channel-open': [TIME_CHANNEL, mutation],
      'game-channel-open': [GAME_CHANNEL, mutation]
    }
  });

  function actionize(config) {
    return transform(config, value => transform(value, ([...args]) => mutation(...args)));
  }
}

function transform(obj, fn) {
  return Object.keys(obj).reduce((agg, key) => {
    agg[key] = fn(obj[key], key);
    return agg;
  }, {});
}

// jshint ignore:start
const {
  STARTED,
  SET_SIGNALER_STATUS,
  CONNECT_TO,
  CONNECT_TO_PARTNER,
  CONNECT_TO_INPUT,
  CLEAR_PARTNERS
} = {
  STARTED: _ => {
    _.status.started = true;
  },

  SET_SIGNALER_STATUS: (_, status) => {
    _.signaler.status = status;
  },

  CONNECT_TO:
    (_, mutation) =>
      CONNECT_TO_PARTNER(_, _.input.connectTo, mutation),

  CONNECT_TO_PARTNER:
    (_, name, mutation) =>
      connectTo(new Uint8Array(name.split(',').map(n => parseInt(n, 10))), [CHAT_CHANNEL_NAME, ISSUES_CHANNEL_NAME, TIME_CHANNEL_NAME, GAME_CHANNEL_NAME], createActions(mutation), undefined),

  CONNECT_TO_INPUT: (_, {target: {value}}) => {
    _.input.connectTo = value;
  },

  CLEAR_PARTNERS: (_) => {
    _.partners = {};
    saveState({currentId: _.signaler.currentId, partners: _.partners});
  }
};
// jshint ignore:end


// jshint ignore:start
const App = ({status: {started}, signaler, conversations, issues}, {mutation}) => (
  <app>
    {!started ? mutation(START)(mutation) : undefined}

    <conversations>
      {Object.values(conversations).map(c => <Conversation conversation={c} />)}
    </conversations>

    <div>
      <form onSubmit={mutation(CONNECT_TO, mutation)} action="javascript:" autoFocus>
        Connect To: <input type="text" onInput={mutation(CONNECT_TO_INPUT)} />
      </form>
    </div>

    <Partners />

    <div>
      Your ID: <id>{signaler.currentId.toString()}</id>
    </div>

    <Console />
  </app>
);
// jshint ignore:end




// jshint ignore:start
const Partners = (_, {partners, mutation}) => (
  <partners>
    <div>Past Partners <button onClick={mutation(CLEAR_PARTNERS)}>clear</button></div>
    <ol>
      {Object.keys(partners).map(name => <li onClick={mutation(CONNECT_TO_PARTNER, name, mutation)}><Partner name={name} data={partners[name]} /></li>)}
    </ol>
  </partners>
);
// jshint ignore:end

// jshint ignore:start
const Partner = ({name, data}, {mutation}) => (
  <partner>
    {name}
  </partner>
);
// jshint ignore:end

render(App, state, document.body);

function stringifyState(state) {
  return JSON.stringify(state, (k, v) => {
    if (v instanceof Uint8Array) {
      return Array.from(v);
    }
    return v;
  });
}

function renderShortID(id) {
  return `${id.slice(0, 3).toString()}..${id.slice(id.length - 4, id.length - 1).toString()}`;
}