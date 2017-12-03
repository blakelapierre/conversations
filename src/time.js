import { h } from 'preact-cycle';

import createChannelHandler from './createChannelHandler';

const TIME_CHANNEL_NAME = 'time';

// jshint ignore:start
const {
  ADD_TIME_MESSAGE,
  SEND_TIME_MESSAGE
} = {
  ADD_TIME_MESSAGE: (_, time, type, {data}) => {
    if (type === 'partner') {
      const parsed = JSON.parse(data);

      if (parsed.type === 'ping') {
        time.channel.send(JSON.stringify({type: 'pong', time: new Date().getTime(), yours: parsed.time}));
      }
      else if (parsed.type === 'pong') {
        const now = new Date().getTime(),
              rtt = now - parsed.yours,
              offset = now - parsed.time,
              latency = (now - parsed.yours) / 2;

        time.partnerClock = parsed.time + offset;

        time.rtt = rtt;
        time.latency = latency;
        time.offset = offset;

        time.maxLatency = Math.max(time.maxLatency || 0, time.latency);
        time.maxOffset = Math.max(time.maxOffset || 0, time.offset);

        time.messages.unshift({type: 'pingpong', time: new Date().getTime(), data: {rtt, offset, latency, adjustedPartnerClock: time.partnerClock, localClock: now, diff: now - time.partnerClock}});
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
        messages: [],
        latency: 0,
        maxLatency: 0
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
    <info>
      <span>Latency: {time.latency.toFixed(1)} ms ({time.maxLatency.toFixed(1)} ms max)</span>
      <BinnedSeries bins={5} max={time.maxLatency} valueSelector={({data}) => data.latency} data={time.messages.slice(0, 10).reverse()} />
    </info>
    <Messages messages={time.messages} start={time.start} />
  </time>
);
// jshint ignore: end

// jshint ignore:start
const BinnedSeries = ({bins, data, max, valueSelector}) => (
  <binned-series>
    {data.map(item => <point style={{'top': 100 * (1 - (1 / bins) - (1 / bins) * Math.floor(valueSelector(item) / (max / bins))) + '%'}}></point>)}
  </binned-series>
);
// jshint ignore: end

// jshint ignore:start
const Messages = ({messages, start}) => (
  <messages>
    {messages.slice(0, 2).map(({type, data, time}) => (
      <message className={type}>
        <container className={`message-time-${5 * Math.round(100 * (time - start) / (new Date().getTime() - start) / 5)}`}>
          <data>{JSON.stringify(data)}</data>
        </container>
      </message>
    ))}
  </messages>
);
// jshint ignore:end


export {Time, TIME_CHANNEL, TIME_CHANNEL_NAME};