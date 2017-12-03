import { Component } from 'preact';
import { h } from 'preact-cycle';

import createChannelHandler from './createChannelHandler';

const GAME_CHANNEL_NAME = 'game';

const Player = (color) => ({
  commands: [],
  color,
  resources: {
    r: {value: 10, max: 100},
    g: {value: 5, max: 100},
    b: {value: 0, max: 100}
  }
});

class Entity {
  constructor({x, y, vx, vy, color, gameState}) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.gameState = gameState;

    this.vxp = vx / gameState.ticksPerSecond;
    this.vyp = vy / gameState.ticksPerSecond;
  }

  update() {
    this.x += this.vxp;
    this.y += this.vyp;

    this.x = Math.min(Math.max(this.x, 0), this.gameState.worldSize.x - 1);
    this.y = Math.min(Math.max(this.y, 0), this.gameState.worldSize.y - 1);
  }
}

const {
  ADD_GAME_MESSAGE,
  COMMAND,
  PROCESS_COMMAND,

  NEW_FRAME,

  CANVAS_CLICK
} = {
  ADD_GAME_MESSAGE: (_, game, who, {data}) => {
    console.log(who, data);

    PROCESS_COMMAND(_, game, who, JSON.parse(data));
  },

  COMMAND: (_, game, mutation) => {
    const message = {type: 'start'};

    game.channel.send(JSON.stringify(message));

    PROCESS_COMMAND(_, game, 'self', message, mutation);
    console.log('sent command');
  },

  PROCESS_COMMAND: (_, {messages, gameState, NEW_FRAME}, who, message, mutation) => {
    const {type, data} = message;

    messages.push(message);

    if (!gameState.started) {
      switch (type) {
        case 'start':
          gameState.started = true;
          gameState.tick = 0;
          gameState.localStart = new Date().getTime();
          gameState.worldSize = {x: 100, y: 50};
          gameState.players = [
            Player('rgb(255, 255, 255)'),
            Player('rgb(255, 64, 64')
          ];
          gameState.localPlayer = who === 'self' ? 0 : 1;
          gameState.remotePlayer = who === 'self' ? 1 : 0;

          runGame(gameState, NEW_FRAME); // should pass mutation?
          break;
      }
    }
    else {
      switch (type) {
        case 'spawn':
          const playerIndex = who === 'self' ? gameState.localPlayer : gameState.remotePlayer;

          if (gameState.players[playerIndex].resources.r.value > 1) {
            const {x, y} = data;

            gameState.entities.push(new Entity({
              x,
              y,
              vx: playerIndex === 0 ? 3 : -3,
              vy: 0,
              color: gameState.players[playerIndex].color,
              gameState
            }));

            gameState.players[playerIndex].commands.push(message);

            gameState.players[playerIndex].resources.r.value--;
          }
          break;
      }
    }
  },

  NEW_FRAME: (_, game) => {
    console.log('new frame');
  },

  CANVAS_CLICK: (_, game, event) => {
    const {x, y} = event,
          {clientWidth, width, clientHeight, height, offsetTop, offsetLeft} = event.target,
          message = {type: 'spawn', data: {x: Math.floor((x - offsetLeft) / clientWidth * width) , y: Math.floor((y - offsetTop) / (clientHeight) * height)}};

    game.channel.send(JSON.stringify(message));

    PROCESS_COMMAND(_, game, 'self', message);

    console.log(event);
  }
};

function runGame(gameState, updateUI) {
  requestAnimationFrame(gameTick);

  function gameTick() {
    gameState.tick++;

    gameState.entities.forEach(entity => entity.update());

    // gameState.entities.forEach(entity => {
    //   entity.x += entity.vxp;
    //   entity.y += entity.vyp;

    //   entity.x = Math.min(Math.max(entity.x, 0), gameState.worldSize.x - 1);
    //   entity.y = Math.min(Math.max(entity.y, 0), gameState.worldSize.y - 1);
    // });

    if (gameState.tick % gameState.ticksPerSecond === 0) {
      gameState.players.forEach(({resources}) => {
        resources.r.value++;
        resources.g.value += 0.5;
        resources.b.value += 0.05;

        resources.r.max = Math.max(resources.r.max, resources.r.value);
        resources.g.max = Math.max(resources.g.max, resources.g.value);
        resources.b.max = Math.max(resources.b.max, resources.b.value);
      });
    }

    requestAnimationFrame(gameTick);

    updateUI();
  }
}

const GAME_CHANNEL =
  createChannelHandler(
    GAME_CHANNEL_NAME,
    ADD_GAME_MESSAGE,
    (partner, channel) =>
      ({
        partner,
        channel,
        start: new Date().getTime(),
        messages: [],
        input: {
          message: undefined
        },
        gameState: {
          tick: 0,
          entities: [],
          players: [],
          ticksPerSecond: 60
        }
      }));


function setGameMutation(game, mutation) {
  game.mutation = mutation;
  game.NEW_FRAME = mutation(NEW_FRAME);
}

// jshint ignore:start
const Game = ({game}, {mutation}) => (
  <game>
    {setGameMutation(game, mutation)}
    <span>Game</span>
    {game.gameState.started ? <GameArea game={game} /> : <StartGame game={game} />}
  </game>
);
// jshint ignore:end

// jshint ignore:start
const StartGame = ({game}, {mutation}) => (
  <start-game>
    <button onClick={mutation(COMMAND, game, mutation)}>Start Game</button>
  </start-game>
);
// jshint ignore:end

// jshint ignore:start
const GameArea = ({game}, {mutation}) => (
  <game-area>
    <stats>
      {game.gameState.players.map(player => <PlayerStats player={player} />)}
    </stats>
    <Canvas game={game} onClick={mutation(CANVAS_CLICK, game)} />
    <message-area>
      <Messages messages={game.messages} />
      {game.gameState.players.map(player => <Messages messages={player.commands} />)}
    </message-area>
  </game-area>
);
// jshint ignore:end

// jshint ignore:start
const PlayerStats = ({player: {resources}}) => (
  <player-stats>
    {Object.keys(resources).map(name => (
      <resource-container className={name}>
        <resource-value>{resources[name].value.toFixed(1)}</resource-value>
        <resource-bar style={{'width': `${resources[name].value / resources[name].max * 100}%`}}></resource-bar>
      </resource-container>
    ))}
  </player-stats>
);
// jshint ignore:end

// jshint ignore:start
const Messages = ({messages}) => (
  <messages>
    {messages.map(({data, type}) => <div>{type}</div>)}
  </messages>
);
// jshint ignore:end

// jshint ignore:start
class Canvas extends Component {
  setCanvas(canvas) {
    this.canvas = canvas;
    this.canvasContext = this.canvasContext || canvas.getContext('2d');
    this.canvasContext.imageSmoothingEnabled = false;
    this.canvasContext.webkitImageSmoothingEnabled = false;
    this.canvasContext.msImageSmoothingEnabled = false;
    // console.log('canvas', canvas);
  }

  componentDidMount() {
    this.game = this.props.game;

    requestAnimationFrame(this.animate.bind(this))
  }

  animate() {
    this.canvasContext.fillStyle = 'rgb(0, 0, 0)';
    this.canvasContext.fillRect(0, 0, 500, 250);

    this.game.gameState.entities.forEach(({x, y, color}) => {
      this.canvasContext.fillStyle = color;
      this.canvasContext.fillRect(x, y, 1, 1);
    })

    requestAnimationFrame(this.animate.bind(this));
  }

  render({game, onClick}) {
    return <canvas width="100" height="50" ref={this.setCanvas.bind(this)} onClick={onClick} />;
  }
}
// jshint ignore:end

export {Game, GAME_CHANNEL, GAME_CHANNEL_NAME};