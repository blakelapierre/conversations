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

  connectTo = server(_.signaler.currentId, {
    'set-signaler-status': mutation(SET_SIGNALER_STATUS),
    'chat-channel': mutation(CHAT_CHANNEL, mutation),
    'issues-channel': mutation(ISSUES_CHANNEL, mutation),
    'partner-message': mutation(PARTNER_MESSAGE)
  });
};

const STARTED = _ => {
  _.status.started = true;
};

const SET_SIGNALER_STATUS = (_, status) => {
  _.signaler.status = status;
};

const CONNECT_TO =
  (_, mutation) =>
    CONNECT_TO_PARTNER(_, _.input.connectTo, mutation);

const CONNECT_TO_PARTNER =
  (_, name, mutation) =>
    connectTo(new Uint8Array(name.split(',').map(n => parseInt(n, 10))), ['chat', 'issues'], {
      'set-status': status => console.log('status', status),
      'set-partner-data': data => console.log('data', data),
      'partner-connected': mutation(PARTNER_CONNECTED),
      'chat-channel': mutation(CHAT_CHANNEL, mutation),
      'issues-channel': mutation(ISSUES_CHANNEL, mutation),
      'partner-message': mutation(PARTNER_MESSAGE)
    }, undefined);

const CONNECT_TO_INPUT = (_, {target: {value}}) => {
  _.input.connectTo = value;
};

const PARTNER_CONNECTED = (_, partner) => {
  console.log('partner connected!');
};

const CHAT_CHANNEL = (_, mutation, partner, channel) => {
  const chat = {partner, channel, messages: [], input: {message: undefined}};

  _.conversations[partner.toString()].channels['chat'] = chat;

  channel.addEventListener('message', mutation(ADD_CHAT_MESSAGE, chat, 'partner'));
};

const ISSUES_CHANNEL = (_, mutation, partner, channel) => {
  const issue = {partner, channel, issues: [], messages: [], input: {message: undefined}};

  _.conversations[partner.toString()].channels['issues'] = issue;

  channel.addEventListener('message', mutation(PROCESS_ISSUE_MESSAGE, issue, 'partner'));
};

const PARTNER_MESSAGE = (_, [partner, message]) => {
  if (_.partners[partner.toString()] === undefined) {
    _.partners[partner.toString()] = {
      discovered: new Date().getTime()
    };

    saveState({currentId: _.signaler.currentId, partners: _.partners});
  }

  _.conversations[partner.toString()] = (_.conversations[partner.toString()] || {partner, channels: {}});

  ADD_LOG_MESSAGE(_, `${renderShortID(partner)}: ${JSON.stringify(message)}`);
};

const CLEAR_PARTNERS = (_) => {
  _.partners = {};
  saveState({currentId: _.signaler.currentId, partners: _.partners});
};

const ADD_CHAT_MESSAGE = (_, conversation, type, {data}) => {
  conversation.messages.push({type, data, time: new Date().getTime()});
};


const SEND_CHAT_MESSAGE = (_, conversation) => {
  console.log('send');
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

const PROCESS_ISSUE_MESSAGE = (_, issue, type, message) => {
  issue.messages.push(message);
};

const NEW_ISSUE = (_, $) => {

};

// jshint ignore:start
const Conversations = ({status: {started}, signaler, conversations, issues}, {mutation}) => (
  <conversations>
    {!started ? mutation(START)(mutation) : undefined}

    {Object.values(conversations).map(c => <Conversation conversation={c} />)}

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
);
// jshint ignore:end

// jshint ignore:start
const Conversation = ({conversation: {partner, channels: {chat, issues}}}, {mutation}) => (
  <conversation>
    <partner-id>{renderShortID(partner)}</partner-id>
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
    <Messages messages={chat.messages} />
    <form onSubmit={mutation(SEND_CHAT_MESSAGE, chat)} action="javascript:" autoFocus>
      <input type="text" value={chat.input.message} onInput={mutation(CHAT_MESSAGE_INPUT, chat)} placeholder="Type your chat message here..." />
    </form>
  </chat>
);
// jshint ignore: end


// jshint ignore:start
const Issues = ({issues}, {mutation}) => (
  <issues>
    <div>Issues</div>
    <issue-list>
      {issues.issues.map(i => <Issue issue={i} />)}
    </issue-list>
    <issue-controls>
      <button onClick={mutation(NEW_ISSUE)}>New Issue</button>
    </issue-controls>
  </issues>
);
// jshint ignore:end


// jshint ignore:start
const Messages = ({messages}) => (
  <messages>
    {messages.map(({type, data, time}) => (
      <message className={type}>
        <data>{data}</data>
        <time>{new Date(time).toString()}</time>
      </message>
    ))}
  </messages>
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

// jshint ignore:start
const Issue = ({issue: {messages}}) => (
  <issue>
    {messages.map(({data}) => (
      <message>
        {JSON.stringify(data)}
      </message>
    ))}
  </issue>
);
// jshint ignore:end

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

function renderShortID(id) {
  return `${id.slice(0, 3).toString()}..${id.slice(id.length - 4, id.length - 1).toString()}`;
}