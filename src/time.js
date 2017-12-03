import { h } from 'preact-cycle';

import createChannelHandler from './createChannelHandler';

const TIME_CHANNEL_NAME = 'time';

// jshint ignore:start
const {
  ADD_TIME_MESSAGE,
  SEND_TIME_MESSAGE
} = {
  ADD_TIME_MESSAGE: (_, time, type, {data}) => {
    // time.messages.unshift({type, data, time: new Date().getTime()});

    if (type === 'partner') {
      const parsed = JSON.parse(data);
      console.log('partner: ', );
      if (parsed.type === 'ping') {
        time.channel.send(JSON.stringify({type: 'pong', time: new Date().getTime(), yours: parsed.time}));
      }
      else if (parsed.type === 'pong') {
        const now = new Date().getTime(),
              rtt = now - parsed.yours,
              offset = now - parsed.time,
              latency = (now - parsed.yours) / 2;

        console.log('rtt', now - parsed.yours);

        time.partnerClock = parsed.time + offset;

        time.messages.unshift({type: 'pingpong', time: new Date().getTime(), data: {rtt, offset, latency, partnerClock: time.partnerClock, localClock: now, diff: now - time.partnerClock}});
      }
    }
  },

  SEND_TIME_MESSAGE: (_, time) => {
    const message = {type: 'ping', time: new Date().getTime()};

    ADD_TIME_MESSAGE(_, time, 'self', {data: message});

    time.channel.send(JSON.stringify(message));
  }
};
// jshint ignore: end

const TIME_CHANNEL =
  createChannelHandler(
    TIME_CHANNEL_NAME,
    ADD_TIME_MESSAGE,
    (partner, channel) =>
      ({
        partner,
        channel,
        start: new Date().getTime(),
        messages: []
      }));

let interval;
function ensurePing(time, mutation) {
  if (!interval) {
    interval = setInterval(mutation(SEND_TIME_MESSAGE, time), 1000);
  }
}

// jshint ignore:start
const Time = ({time}, {mutation}) => (
  <time>
    {ensurePing(time, mutation)}
    Time
    <Messages messages={time.messages} start={time.start} />
  </time>
);
// jshint ignore: end

// jshint ignore:start
const Messages = ({messages, start}) => (
  <messages>
    {messages.map(({type, data, time}) => (
      <message className={type}>
        <container className={`message-time-${5 * Math.round(100 * (time - start) / (new Date().getTime() - start) / 5)}`}>
          <data>{JSON.stringify(data)}</data>
          <time>{new Date(time).toString()}</time>
        </container>
      </message>
    ))}
  </messages>
);
// jshint ignore:end


export {Time, TIME_CHANNEL, TIME_CHANNEL_NAME};