import { h } from 'preact-cycle';

import {Chat, CHAT_CHANNEL, CHAT_CHANNEL_NAME} from './chat';
import {Issues, ISSUES_CHANNEL, ISSUES_CHANNEL_NAME} from './issues';
import {Time, TIME_CHANNEL, TIME_CHANNEL_NAME} from './time';
import {Game, GAME_CHANNEL, GAME_CHANNEL_NAME} from './game';
import {Location, LOCATION_CHANNEL, LOCATION_CHANNEL_NAME} from './location';


// jshint ignore:start
const Conversation = ({conversation: {partner, context, channels: {chat, issues, time, game}}}, {partners, mutation}) => (
  <conversation className={context.iceConnectionState}>
    <partner-info>
      <id>{renderShortID(partner)}</id>
      {context.discoveredAt ? <discovered-at>Discovered At: {new Date(context.discoveredAt).toString()}</discovered-at> : undefined}
      {context.connectedAt ? <connected-at>Connected At: {new Date(context.connectedAt[0]).toString()}</connected-at> : undefined}
      {context.disconnectedAt ? <disconnected-at>Disconnected At: {new Date(context.disconnectedAt[0]).toString()}</disconnected-at> : undefined}
    </partner-info>
    <channels>
      {time ? <Time time={time} /> : undefined}
      {chat ? <Chat chat={chat} /> : undefined}
      {issues ? <Issues issues={issues} /> : undefined}
      {game ? <Game game={game} /> : undefined}
      {location ? <Location location={location} /> : undefined}
    </channels>
  </conversation>
);
// jshint ignore:end

export {Conversation, CHAT_CHANNEL, CHAT_CHANNEL_NAME, ISSUES_CHANNEL, ISSUES_CHANNEL_NAME, GAME_CHANNEL, GAME_CHANNEL_NAME, TIME_CHANNEL, TIME_CHANNEL_NAME, LOCATION_CHANNEL, LOCATION_CHANNEL_NAME};

function renderShortID(id) {
  return `${id.slice(0, 3).toString()}..${id.slice(id.length - 4, id.length - 1).toString()}`;
}