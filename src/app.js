import { h, render } from 'preact-cycle';

import server from './server';

import client from './client';

const state = getState();

function getState() {
  let state = localStorage.getItem('state');
  if (state) return JSON.parse(state, (k, v) => {
    if (k === 'currentId') return new Uint8Array(v);
    return v;
  });

  state = {
    status: {
      started: false
    },
    signaler: {
      currentId: new Uint8Array(64),
      status: 'Not Connected'
    },
    input: {
      connectTo: undefined,
      message: undefined
    },
    conversations: []
  };

  const id = new Uint8Array(64);

  window.crypto.getRandomValues(state.signaler.currentId);

  state.currentId = id;

  saveState(state);

  return state;
}

function saveState(state) {
  localStorage.setItem('state', stringifyState(state));
  console.log(state);
}


const START = (_, mutation) => {
  mutation(STARTED)();

  server(_.signaler.currentId, {
    'set-signaler-status': mutation(SET_SIGNALER_STATUS),
    'chat-channel': mutation(SERVER_CHAT_CHANNEL, mutation)
  });
};

const STARTED = _ => {
  console.log('started');
  _.status.started = true;
};

const SET_SIGNALER_STATUS = (_, status) => {
  _.signaler.status = status;
};

const CONNECT_TO = (_, mutation) => {
  client(new Uint8Array(_.input.connectTo.split(',').map(n => parseInt(n, 10))), {
    'set-status': status => console.log('status', status),
    'set-partner-data': data => console.log('data', data),
    'chat-channel': mutation(CLIENT_CHAT_CHANNEL, mutation)
  }, undefined);
};

const CONNECT_TO_INPUT = (_, {target: {value}}) => {
  _.input.connectTo = value;
};

const SERVER_CHAT_CHANNEL = (_, mutation, channel) => {
  console.log('server chat channel');
  const conversation = {channel, messages: [], input: {message: undefined}};
  conversation.messages.push(conversation);
  _.conversations.push(conversation);

  channel.addEventListener('message', mutation(ADD_SERVER_CHAT_MESSAGE, conversation));
};

const CLIENT_CHAT_CHANNEL = (_, mutation, channel) => {
  const conversation = {channel, messages: [], input: {message: undefined}};
  conversation.messages.push(conversation);
  _.conversations.push(conversation);

  channel.addEventListener('message', mutation(ADD_CLIENT_CHAT_MESSAGE, conversation));
};

const ADD_SERVER_CHAT_MESSAGE = (_, conversation, {data}) => {
  console.log('server', data, conversation);
  conversation.messages.push(data);
};

const ADD_CLIENT_CHAT_MESSAGE = (_, conversation, {data}) => {
  console.log('client', data, conversation);
  conversation.messages.push(data);
};

const SEND_CHAT_MESSAGE = (_, conversation) => {
  conversation.channel.send(conversation.input.message);
  conversation.input.message = '';
};

const CHAT_MESSAGE_INPUT = (_, conversation, {target:{value}}) => {
  conversation.input.message = value;
};

const Conversation = ({conversation}, {mutation}) => (
  // jshint ignore:start
  <conversation>
    {conversation.messages.map(message => <div>{message}</div>)}

    <form onSubmit={mutation(SEND_CHAT_MESSAGE, conversation)} action="javascript:" autoFocus>
      <input type="text" value={conversation.input.message} onInput={mutation(CHAT_MESSAGE_INPUT, conversation)} />
    </form>
  </conversation>
  // jshint ignore: end
);

const Conversations = ({status: {started}, signaler, conversations}, {mutation}) => (
  // jshint ignore:start
  <conversations>
    {!started ? mutation(START)(mutation) : undefined}

    {conversations.map(c => <Conversation conversation={c} />)}
      {console.log('c', conversations)}

    <div>
      <form onSubmit={mutation(CONNECT_TO, mutation)} action="javascript:" autoFocus>
        Connect To: <input type="text" onInput={mutation(CONNECT_TO_INPUT)} />
      </form>
    </div>

    <div>
      Your ID: <id>{signaler.currentId.toString()}</id>
    </div>
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