import { h } from 'preact-cycle';

import createChannelHandler from './createChannelHandler';

const LOCATION_CHANNEL_NAME = 'location';

// jshint ignore:start
const {
  ADD_LOCATION_MESSAGE,
  SEND_LOCATION_MESSAGE,

  TOGGLE_LATENCY_LOG
} = {
  ADD_LOCATION_MESSAGE: (_, location, type, {data}) => {
    if (type === 'partner') {
      const parsed = JSON.parse(data);

      console.log('location partner message', parsed);
    }
  },

  SEND_LOCATION_MESSAGE: (_, location) => {
    const message = {type: 'location', time: new Date().getTime()};

    ADD_LOCATION_MESSAGE(_, time, 'self', {data: message});

    location.channel.send(JSON.stringify(message));
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

window.addEventListener('devicemotion', event => console.log('devicemotion', event));
window.addEventListener('deviceorientation', event => console.log('deviceorientation', event));

if (window.navigator.geolocation) {
  window.navigator.geolocation.watchPosition(
    position => console.log('position', position),
    error => console.log('position error!', error));
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