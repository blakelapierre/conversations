
const RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection,
      peerConnections = {};

const SIGNALER_IP = '192.168.0.105',
      SIGNALER_PORT = 8080;


/*
actions:
  set-status,
  set-partner-data,
  chat-channel


*/

export default function connectTo(partner, actions, context) {
  actions['set-status'].call(context, 'Connecting to signaler...');

  if (WebSocket && window.crypto) {
    const socket = new WebSocket(`ws://${SIGNALER_IP}:${SIGNALER_PORT}`);

    let peerConnection;

    socket.addEventListener('open', event => {
      actions['set-status'].call(context, 'Connected to signaler...');

      const id = new Uint8Array(64);

      window.crypto.getRandomValues(id);

      socket.send(id);
      socket.send(partner);

      peerConnection = new RTCPeerConnection({
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
        actions['chat-channel'](chatDataChannel);
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
    });

// jshint ignore:start
    function processQueue() {
      queue.forEach(message => {
        processPartnerMessage(partner, message);
      });

      queue.splice(0);
    }

    const queue = [];
    let readingPartner = false;
    socket.addEventListener('message', event => {
      const {data} = event;

      if (data instanceof Blob) {
        readingPartner = true;

        const reader = new FileReader();
        reader.addEventListener('load', () => {partner = new Uint8Array(reader.result); console.log(reader, partner); readingPartner = false; processQueue();});
        reader.readAsArrayBuffer(data);
      }
      else if (data !== '') {
        queue.push(data);

        if (!readingPartner) processQueue();
      }
    });

    function processPartnerMessage(partner, data) {
      if (!partner) throw new Error('Protocol error! No Partner!', partner, data);

      const message = JSON.parse(data);

      switch (message.type) {
        case 'offer': receiveOffer(partner, message); break;
        case 'answer': receiveAnswer(partner, message); break;
        default: receiveCandidate(partner, message); break;
      }
    }

    function receiveAnswer(partner, message) {
      peerConnection.setRemoteDescription(message);
    }

    function receiveCandidate(partner, message) {
      peerConnection.addIceCandidate(message);
    }
// jshint ignore:end

    socket.addEventListener('close', () => {
      setTimeout(() => connectTo(partner), 5000);
    });
  }
  else {
    actions['set-status'].call(context, 'Your browser does not currently support all Web features required to use this page.');
  }
}