import { h, render } from 'preact-cycle';

import server from './server';

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
    conversations: [],
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

  connectTo = server(_.signaler.currentId, {
    'set-signaler-status': mutation(SET_SIGNALER_STATUS),
    'chat-channel': mutation(CHAT_CHANNEL, mutation),
    'partner-message': mutation(PARTNER_MESSAGE)
  });
};

const STARTED = _ => {
  _.status.started = true;
};

const SET_SIGNALER_STATUS = (_, status) => {
  _.signaler.status = status;
};

const CONNECT_TO = (_, mutation) => {
  connectTo(new Uint8Array(_.input.connectTo.split(',').map(n => parseInt(n, 10))), {
    'set-status': status => console.log('status', status),
    'set-partner-data': data => console.log('data', data),
    'chat-channel': mutation(CHAT_CHANNEL, mutation),
    'partner-message': mutation(PARTNER_MESSAGE)
  }, undefined);
};

const CONNECT_TO_PARTNER = (_, name, mutation) => {
  connectTo(new Uint8Array(name.split(',').map(n => parseInt(n, 10))), {
    'set-status': status => console.log('status', status),
    'set-partner-data': data => console.log('data', data),
    'chat-channel': mutation(CHAT_CHANNEL, mutation),
    'partner-message': mutation(PARTNER_MESSAGE)
  }, undefined);
};

const CONNECT_TO_INPUT = (_, {target: {value}}) => {
  _.input.connectTo = value;
};

const CHAT_CHANNEL = (_, mutation, channel) => {
  const conversation = {channel, messages: [], input: {message: undefined}};
  conversation.messages.push(conversation);
  _.conversations.push(conversation);

  channel.addEventListener('message', mutation(ADD_CHAT_MESSAGE, conversation, 'partner'));
};

const PARTNER_MESSAGE = (_, [partner, message]) => {
  if (_.partners[partner.toString()] === undefined) {
    _.partners[partner.toString()] = {
      discovered: new Date().getTime()
    };

    saveState({currentId: _.signaler.currentId, partners: _.partners});
  }

  ADD_LOG_MESSAGE(_, `${partner.slice(0, 3).toString()}..${partner.slice(partner.length - 4, partner.length - 1).toString()}: ${JSON.stringify(message)}`);
};

const CLEAR_PARTNERS = (_) => {
  _.partners = {};
  saveState({currentId: _.signaler.currentId, partners: _.partners});
};

const ADD_CHAT_MESSAGE = (_, conversation, type, {data}) => {
  conversation.messages.push({type, data});
};


const SEND_CHAT_MESSAGE = (_, conversation) => {
  const {message} = conversation.input;

  ADD_CHAT_MESSAGE(_, conversation, 'self', {data: message});

  conversation.channel.send(message);
  conversation.input.message = '';
};

const CHAT_MESSAGE_INPUT = (_, conversation, {target:{value}}) => {
  conversation.input.message = value;
};

const ADD_LOG_MESSAGE = ({log}, message) => {
  log.unshift(message);
};

const Conversation = ({conversation}, {mutation}) => (
  // jshint ignore:start
  <conversation>
    {conversation.messages.map(({type, data}) => <div className={type}>{data}</div>)}

    <form onSubmit={mutation(SEND_CHAT_MESSAGE, conversation)} action="javascript:" autoFocus>
      <input type="text" value={conversation.input.message} onInput={mutation(CHAT_MESSAGE_INPUT, conversation)} />
    </form>
  </conversation>
  // jshint ignore: end
);

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

// jshint ignore:start
const Console = (_, {log = []}) => (
  <console>
    <div>Log</div>
    <log>
      {log.map(message => <div>{message}</div>)}
    </log>
  </console>
);
  // jshint ignore:end

const Conversations = ({status: {started}, signaler, conversations}, {mutation}) => (
  // jshint ignore:start
  <conversations>
    {!started ? mutation(START)(mutation) : undefined}

    {conversations.map(c => <Conversation conversation={c} />)}

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
  </conversations>
  // jshint ignore:end
);

render(
  // jshint ignore:start
  Conversations, state, document.body
  // jshint ignore:end
);


function stringifyState(state) {
  return JSON.stringify(state, (k, v) => {
    if (v instanceof Uint8Array) {
      return Array.from(v);
    }
    return v;
  });
}