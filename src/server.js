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

const SIGNALER_IP = 'localhost', //'192.168.0.105',
      SIGNALER_PORT = 443,
      HOST = window.location.host; //`${SIGNALER_IP}:${SIGNALER_PORT}`; //8080;

/*
actions:
  set-signaler-status,
  chat-channel,
  partner-message
*/
export default function connect(id, actions) {
  if (WebSocket && window.crypto) {

    // const socket = new WebSocket(`ws://${SIGNALER_IP}:${SIGNALER_PORT}`);
    const socket = new WebSocket(`wss://${HOST}/signaler`);

    handle(socket, id, actions);

    return (partner, programs, actions) => {
      socket.send(partner);

      let peerConnection = new RTCPeerConnection({
        iceServers: [
          {urls: 'stun:stun.stunprotocol.org'}
        ],
        iceTransports: 'all'
      });

      const data = {connection: peerConnection};
      peerConnections[partner.join(',')] = data;

      programs.forEach(program => {
        const dataChannel = createDataChannel(program, peerConnection, actions);
        data[`${program}DataChannel`] = dataChannel;
      });

      peerConnection
        .createOffer(
          offer => peerConnection.setLocalDescription(offer).then(() => socket.send(JSON.stringify(offer))),
          error => console.log('error', error));





      peerConnection.addEventListener('icecandidate', ({candidate}) => {
        if (candidate) {
          socket.send(JSON.stringify(candidate));
        }
      });

      peerConnection.addEventListener('icegatheringstatechange', event => {
        // actions['set-status'](event.target.iceGatheringState);
      });

      peerConnection.addEventListener('iceconnectionstatechange', event => {
        actions['peer']['ice-connection-state'](partner, event.target.iceConnectionState);
      });

      peerConnection.addEventListener('open', event => {
        actions['peer']['connection-state'](partner, 'connected');
      });

      peerConnection.addEventListener('close', event => {
        actions['peer']['connection-state'](partner, 'closed');
      });

      function createDataChannel(name, peerConnection, actions) {
        const dataChannel = peerConnection.createDataChannel(name);

        dataChannel.addEventListener('open', () => actions['peer'][`${name}-channel-open`](partner, dataChannel));
        // dataChannel.addEventListener('close', () => actions[`${name}-channel-close`](partner, dataChannel));
      }
    };
  }
}

const peerConnections = {};

function handle(socket, id, actions) {
  const queue = [];

  let partner, readingPartner = false;

  socket.addEventListener('open', event => {
    actions['signal']['connection-state']('connected');

    socket.send(id);
  });

  function processQueue() {
    queue.forEach(message => {
      processPartnerMessage(partner, message);
    });

    queue.splice(0);
  }

  socket.addEventListener('message', event => {
    console.log(event);
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
    actions['signal']['connection-state']('Not Connected');

    setTimeout(() => connect(actions), 5000);
  });

  function processPartnerMessage(partner, data) {
    if (!partner) throw new Error('Protocol error! No Partner!', partner, data);

    const message = JSON.parse(data);

    actions['signal']['partner-message']([partner, message]);

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

      console.dir(channel);

      peerConnections[partner].dataChannel = channel;

      actions['peer'][`${channel.label}-channel-open`](partner, channel);
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

    peerConnection.addEventListener('iceconnectionstatechange', event => {
      actions['peer']['ice-connection-state'](partner, event.target.iceConnectionState);
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