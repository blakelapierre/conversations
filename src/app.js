import { h, render } from 'preact-cycle';

import server from './server';

const state = getState();

// https://stackoverflow.com/questions/879152/how-do-i-make-javascript-beep
const notificationSound =  new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");

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
    ICE_GATHERING_STATE_CHANGE,
    CHAT_CHANNEL,
    ISSUES_CHANNEL
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
    },

    CHAT_CHANNEL: createChannelHandler('chat', ADD_CHAT_MESSAGE, (partner, channel) => ({partner, channel, start: new Date().getTime(), messages: [], input: {message: undefined}})),

    ISSUES_CHANNEL: createChannelHandler('issues', PROCESS_ISSUE_MESSAGE, (partner, channel) => ({partner, channel, issues: [], messages: [], input: {message: undefined}}))
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
      'issues-channel-open': [ISSUES_CHANNEL, mutation]
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
  ADD_CHAT_MESSAGE,
  CLEAR_PARTNERS,
  SEND_CHAT_MESSAGE,
  CHAT_MESSAGE_INPUT,
  ADD_LOG_MESSAGE,
  PROCESS_ISSUE_MESSAGE,
  NEW_ISSUE,
  ADD_ISSUE,
  SHOW_ISSUE,
  ISSUES_MESSAGE_INPUT
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
      connectTo(new Uint8Array(name.split(',').map(n => parseInt(n, 10))), ['chat', 'issues'], createActions(mutation), undefined),

  CONNECT_TO_INPUT: (_, {target: {value}}) => {
    _.input.connectTo = value;
  },

  ADD_CHAT_MESSAGE: (_, chat, type, {data}) => {
    chat.messages.unshift({type, data, time: new Date().getTime()});
    notificationSound.play();
  },

  CLEAR_PARTNERS: (_) => {
    _.partners = {};
    saveState({currentId: _.signaler.currentId, partners: _.partners});
  },

  SEND_CHAT_MESSAGE: (_, chat) => {
    console.log('send');
    const {message} = chat.input;

    ADD_CHAT_MESSAGE(_, chat, 'self', {data: message});

    chat.channel.send(message);
    chat.input.message = '';
  },

  CHAT_MESSAGE_INPUT: (_, chat, {target:{value}}) => {
    chat.input.message = value;
  },

  ADD_LOG_MESSAGE: ({log}, message) => {
    log.unshift(message);
  },

  PROCESS_ISSUE_MESSAGE: (_, issue, type, {data}) => {
    ADD_ISSUE(_, issue, 'partner', JSON.parse(data));
  },

  NEW_ISSUE: (_, issues) => {
    const {message} = issues.input,
          data = {time: new Date().getTime(), message, creator: _.signaler.currentId.toString()};

    ADD_ISSUE(_, issues, 'self', data);

    issues.channel.send(JSON.stringify(data));
    issues.input.message = '';
  },

  ADD_ISSUE: (_, issues, type, data) => {
    const issue = {id: issues.issues.length + 1, messages: [data]};

    issues.messages.push(issue);
    issues.issues.push(issue);

    SHOW_ISSUE(_, issues, issue);
  },

  ISSUES_MESSAGE_INPUT: (_, issues, {target: {value}}) => {
    issues.input.message = value;
  },

  SHOW_ISSUE: (_, issues, issue) => {
    issues.issueDetail = issue;
  }
};
// jshint ignore:end


function createChannelHandler(name, handler, contextCreator) {
  return (_, mutation, partner, channel) => {
    const context = contextCreator(partner, channel);

    _.conversations[partner.toString()].channels[name] = context;

    channel.addEventListener('message', mutation(handler, context, 'partner'));
  };
}


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
const Conversation = ({conversation: {partner, context, channels: {chat, issues}}}, {partners, mutation}) => (
  <conversation className={context.iceConnectionState}>
    <partner-info>
      <id>{renderShortID(partner)}</id>
      {context.discoveredAt ? <discovered-at>Discovered At: {new Date(context.discoveredAt).toString()}</discovered-at> : undefined}
      {context.connectedAt ? <connected-at>Connected At: {new Date(context.connectedAt[0]).toString()}</connected-at> : context.iceConnectionState}
    </partner-info>
    <channels>
      {chat ? <Chat chat={chat} /> : undefined}
      {issues ? <Issues issues={issues} /> : undefined}
    </channels>
  </conversation>
);
// jshint ignore:end

// jshint ignore:start
const Chat = ({chat}, {mutation}) => (
  <chat>
    <form onSubmit={mutation(SEND_CHAT_MESSAGE, chat)} action="javascript:" autoFocus>
      <input type="text" value={chat.input.message} onInput={mutation(CHAT_MESSAGE_INPUT, chat)} placeholder="Type your chat message here..." />
    </form>
    <Messages messages={chat.messages} start={chat.start} />
  </chat>
);
// jshint ignore: end

// jshint ignore:start
const Messages = ({messages, start}) => (
  <messages>
    {messages.map(({type, data, time}) => (
      <message className={type}>
        <container className={`message-time-${5 * Math.round(100 * (time - start) / (new Date().getTime() - start) / 5)}`}>
          <data>{data}</data>
          <time>{new Date(time).toString()}</time>
        </container>
      </message>
    ))}
  </messages>
);
// jshint ignore:end

// jshint ignore:start
const Issues = ({issues}, {mutation}) => (
  <issues>
    <div>Issues</div>
    <issue-list>
      {issues.issues.map(issue => <issue-id onClick={mutation(SHOW_ISSUE, issues, issue)} className={{'shown': issue === issues.issueDetail}}>{issue.id}</issue-id>)}
    </issue-list>
    <issue-detail>
      {issues.issueDetail ? <Issue issue={issues.issueDetail} /> : undefined}
    </issue-detail>
    <issue-input>
      <form onSubmit={mutation(NEW_ISSUE, issues)} action="javascript:" autoFocus>
        <input type="text" value={issues.input.message} onInput={mutation(ISSUES_MESSAGE_INPUT, issues)} placeholder="Type your issue here..." />
        <button>New Issue</button>
      </form>
    </issue-input>
  </issues>
);
// jshint ignore:end

// jshint ignore:start
const Issue = ({issue: {id, messages}}) => (
  <issue>
    <messages>
      {messages.map(({message}) => (
        <message>
          {message}
        </message>
      ))}
    </messages>
  </issue>
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

render(
  // jshint ignore:start
  App, state, document.body
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

function renderShortID(id) {
  return `${id.slice(0, 3).toString()}..${id.slice(id.length - 4, id.length - 1).toString()}`;
}