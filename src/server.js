// function updateState(state) {
//   for (let partner in peerConnections) sendState(partner, state);
// }

// function sendState(partner, state) {
//   const {dataChannel} = peerConnections[partner];
//   try {
//     dataChannel.send(stringifyState(state));
//   }
//   catch (e) {
//     console.log(`Error sending to ${partner}`, e);
//   }
// }

const SIGNALER_IP = '192.168.0.105',
      SIGNALER_PORT = 8080;

/*
actions:
  set-signaler-status,
  chat-channel,
  partner-message
*/
export default function connect(id, actions) {
  if (WebSocket && window.crypto) {

    const socket = new WebSocket(`ws://${SIGNALER_IP}:${SIGNALER_PORT}`);

    handle(socket, id, actions);

    return (partner, actions) => {
      socket.send(partner);

      let peerConnection = new RTCPeerConnection({
        iceServers: [
          {urls: 'stun:stun.stunprotocol.org'}
        ],
        iceTransports: 'all'
      });

      const chatDataChannel = peerConnection.createDataChannel('chat');

      peerConnections[partner.join(',')] = {connection: peerConnection, dataChannel: chatDataChannel};

      // chatDataChannel.addEventListener('message', ({data}) => actions['set-partner-data'](partner, JSON.parse(data)));
      chatDataChannel.addEventListener('open', () => {
        actions['set-status']('chat open');
        actions['chat-channel'](partner, chatDataChannel);
      });
      chatDataChannel.addEventListener('close', () => actions['set-status']('chat close'));

      peerConnection
        .createOffer(
          offer => peerConnection.setLocalDescription(offer).then(() => socket.send(JSON.stringify(offer))),
          error => console.log('error', error));

      peerConnection.addEventListener('icecandidate', ({candidate}) => {
        if (candidate) {
          socket.send(JSON.stringify(candidate));
        }
      });

      peerConnection.addEventListener('iceconnectionstatechange', event => {
        actions['set-status'](event.target.iceConnectionState);
      });

      peerConnection.addEventListener('icegatheringstatechange', event => {
        actions['set-status'](event.target.iceGatheringState);
      });

      peerConnection.addEventListener('connectionstatechange', event => {
        actions['set-status'](event.target.connectionState);
      });
    };
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

    actions['partner-message']([partner, message]);

    switch (message.type) {
      case 'offer': receiveOffer(partner, message); break;
      case 'answer': receiveAnswer(partner, message); break;
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

    peerConnections[partner] = {connection: peerConnection, partner};

    peerConnection.addEventListener('datachannel', event => {
      const {channel} = event;

      peerConnections[partner].dataChannel = channel;

      actions['chat-channel'](partner, channel);
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

  function receiveAnswer(partner, message) {
    const {connection} = peerConnections[partner];
    connection.setRemoteDescription(message);
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