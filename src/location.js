import { h } from 'preact-cycle';

import createChannelHandler from './createChannelHandler';

const LOCATION_CHANNEL_NAME = 'time';

// jshint ignore:start
const {
  ADD_LOCATION_MESSAGE,
  SEND_LOCATION_MESSAGE,

  TOGGLE_LATENCY_LOG
} = {
  ADD_LOCATION_MESSAGE: (_, time, type, {data}) => {
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

        time.partnerClock = parsed.time + latency;

        time.rtt = rtt;
        time.latency = latency;
        time.offset = offset;

        time.maxLatency = Math.max(time.maxLatency || 0, time.latency);
        time.maxOffset = Math.max(time.maxOffset || 0, time.offset);

        time.messages.unshift({type: 'pingpong', time: new Date().getTime(), data: {rtt, offset, latency, adjustedPartnerClock: time.partnerClock, localClock: now, diff: now - time.partnerClock}});
      }
    }
  },

  SEND_LOCATION_MESSAGE: (_, time) => {
    const message = {type: 'ping', time: new Date().getTime()};

    ADD_LOCATION_MESSAGE(_, time, 'self', {data: message});

    time.channel.send(JSON.stringify(message));
  },

  POSITION_RECEIVED: (_, location, {timestamp, coords: {latitude, longitude, altitude, accuracy, altitudeAccuracy, heading, speed}}) => {
    location.positions.unshift([new Date().getTime(), {timestamp, coords: {latitude, longitude, altitude, accuracy, altitudeAccuracy, heading, speed}}]);

    location.yourPosition[0] = latitude;
    location.yourPosition[1] = longitude;

    location.distance

    delete location.error;
  },

  POSITION_ERROR: (_, location, error) => {
    location.errors.unshift([new Date().getTime(), {code: error.code, message: error.message}]);

    location.error = location.errors[0];
  }
};
// jshint ignore: end

const LOCATION_CHANNEL =
  createChannelHandler(
    LOCATION_CHANNEL_NAME,
    ADD_LOCATION_MESSAGE,
    (partner, channel) =>
      ({
        partner,
        channel,
        start: new Date().getTime(),
        messages: [],
        partnerLocation: [],
        yourLocation: [],
        distance: 0
      }));

let interval;
function ensurePing(time, mutation) {
  if (!interval) {
    interval = setInterval(mutation(SEND_LOCATION_MESSAGE, time), 1000);
  }
}

window.addEventListener('devicemotion', event => console.log('devicemotion', event));
window.addEventListener('deviceorientation', event => console.log('deviceorientation', event));

if (window.navigator.geolocation) {
  window.navigator.geolocation.watchPosition(
    position => console.log('position', position),
    error => console.log('position error!', error));
}

let watchID;
function ensureGeolocationWatch(location, mutation) {
  if (watchID === undefined) {
    watchID = window.navigator.geolocation.watchPosition(
      position => mutation(POSITION_RECEIVED, location),
      error => mutation(POSITION_ERROR, location));
  }
}

// jshint ignore:start
const Location = ({location}, {mutation}) => (
  <location>
    Partner Location:
    Your Location:
    Surface Distance:
  </location>
);
// jshint ignore: end


export {Location, LOCATION_CHANNEL, LOCATION_CHANNEL_NAME};