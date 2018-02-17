export default function createChannelHandler(name, handler, contextCreator) {
  return (_, mutation, partner, channel) => {
    const context = contextCreator(partner, channel);
console.log('creating channel handler', name);
    _.conversations[partner.toString()].channels[name] = context;

    channel.addEventListener('message', mutation(handler, context, 'partner'));
  };
}