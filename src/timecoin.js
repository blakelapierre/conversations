import { h, render } from 'preact-cycle';

import createChannelHandler from './createChannelHandler';

const TIMECOIN_CHANNEL_NAME = 'timecoin';

// jshint ignore:start
const {
  ADD_TIMECOIN_MESSAGE,
  SEND_TIMECOIN_MESSAGE
} = {
  ADD_TIMECOIN_MESSAGE: (_, timecoin, type, {data}) => {
    console.log('_', _);
    timecoin.messages.unshift({type, data, time: new Date().getTime()});
    notificationSound.play();
  },

  SEND_TIMECOIN_MESSAGE: (_, timecoin) => {
    console.log('send');
    const {message} = timecoin.input;

    ADD_TIMECOIN_MESSAGE(_, timecoin, 'self', {data: message});

    timecoin.channel.send(message);
    timecoin.input.message = '';
  }
};
// jshint ignore: end

const TIMECOIN_CHANNEL =
  createChannelHandler(
    TIMECOIN_CHANNEL_NAME,
    ADD_TIMECOIN_MESSAGE,
    (partner, channel) =>
      ({
        partner,
        channel,
        start: new Date().getTime(),
        messages: [],
        input: {
          message: undefined
        }
      }));

// jshint ignore:start
const Timecoin = ({timecoin}, {mutation}) => (
  <timecoin>
    timecointimecoin
    <Messages messages={timecoin.messages} start={timecoin.start} />
  </timecoin>
);
// jshint ignore: end

// jshint ignore:start
const Messages = ({messages, start}) => (
  <messages>
    {messages.map(({type, data, time}) => (
      <message className={type}>
        <container className={`message-time-${5 * Math.round(100 * (time - start) / (new Date().getTime() - start) / 5)}`}>
          {/^data:image\/png;base64,.*$/.test(data) ? <img src={data} /> :<data>{data}</data>}
          <time>{new Date(time).toISOString()}</time>
        </container>
      </message>
    ))}
  </messages>
);
// jshint ignore:end


export {Timecoin, TIMECOIN_CHANNEL, TIMECOIN_CHANNEL_NAME};