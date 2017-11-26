function updateState(state) {
  for (let partner in peerConnections) sendState(partner, state);
}

function sendState(partner, state) {
  const {dataChannel} = peerConnections[partner];
  try {
    dataChannel.send(stringifyState(state));
  }
  catch (e) {
    console.log(`Error sending to ${partner}`, e);
  }
}

const SIGNALER_IP = '192.168.0.105',
      SIGNALER_PORT = 8080;

/*
actions:
  got-id,
  set-signaler-status,
  chat-channel
*/
export default function connect(id, actions) {
  if (WebSocket && window.crypto) {

    const socket = new WebSocket(`ws://${SIGNALER_IP}:${SIGNALER_PORT}`);

    handle(socket, id, actions);
  }
}

const peerConnections = {};

function handle(socket, id, actions) {
  const queue = [];

  let partner, readingPartner = false;

  socket.addEventListener('open', event => {
    actions['set-signaler-status']('Connected');

    socket.send(id);
  });

  function processQueue() {
    queue.forEach(message => {
      processPartnerMessage(partner, message);
    });

    queue.splice(0);
  }

  socket.addEventListener('message', event => {
    const {data} = event;
    if (data instanceof Blob) {
      readingPartner = true;
      const reader = new FileReader();
      reader.addEventListener('load', () => {partner = new Uint8Array(reader.result);readingPartner = false; processQueue();});
      reader.readAsArrayBuffer(data);
    }
    else if (data !== '') {
      queue.push(data);

      if (!readingPartner) processQueue();
    }
  });

  socket.addEventListener('close', () => {
    actions['set-signaler-status']('Not Connected');

    setTimeout(() => connect(actions), 5000);
  });

  function processPartnerMessage(partner, data) {
    if (!partner) throw new Error('Protocol error! No Partner!', partner, data);

    const message = JSON.parse(data);

    switch (message.type) {
      case 'offer': receiveOffer(partner, message); break;
      case 'answer': recieveAnswer(partner, message); break;
      default: receiveCandidate(partner, message); break;
    }

    console.log(`Message from ${partner.join(',')}: ${data}`);
  }

  const RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

  function receiveOffer(partner, message) {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        {urls: 'stun:stun.stunprotocol.org'}
      ],
      iceTransports: 'all'
    });

    peerConnections[partner] = {connection: peerConnection};

    console.log({peerConnections});

    peerConnection.addEventListener('datachannel', event => {
      console.log('datachannel');
      const {channel} = event;

      peerConnections[partner].dataChannel = channel;

      actions['chat-channel'](channel);

      console.log('datachannel open', event);
      channel.send(stringifyState(state));
      // channel.addEventListener('open', event => {
      // });

      // channel.addEventListener('message', event => {
      //   const message = JSON.parse(event.data);

      //   if (message.meal !== undefined) {
      //     actions['add-meal-to-plan'](message.meal);
      //   }
      // });
    });

    peerConnection
      .setRemoteDescription(message)
      .then(() =>
            peerConnection
            .createAnswer()
            .then(answer => {
              peerConnection.setLocalDescription(answer);
              socket.send(partner);
              socket.send(JSON.stringify(answer));
            })
           )
      .catch(error => console.log(error));

    peerConnection.addEventListener('icecandidate', ({candidate}) => {
      if (candidate) {
        if (!readingPartner) socket.send(partner);
        socket.send(JSON.stringify(candidate));
      }
    });
  }

  function receiveCandidate(partner, candidate) {
    const {connection} = peerConnections[partner];
    connection.addIceCandidate(candidate);
  }
}

function stringifyState(state) {
  return JSON.stringify(state, (k, v) => {
    if (v instanceof Uint8Array) {
      return Array.from(v);
    }
    return v;
  });
}