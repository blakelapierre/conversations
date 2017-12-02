import { Component } from 'preact';
import { h } from 'preact-cycle';

import createChannelHandler from './createChannelHandler';

const GAME_CHANNEL_NAME = 'game';

const {
  ADD_GAME_MESSAGE,
  COMMAND,
  PROCESS_COMMAND,

  CANVAS_CLICK
} = {
  ADD_GAME_MESSAGE: (_, game, who, {data}) => {
    console.log(who, data);

    PROCESS_COMMAND(_, game, who, JSON.parse(data));
  },

  PROCESS_COMMAND: (_, game, who, {type, data}) => {
    game.messages.push({type, data});

    switch (type) {
      case 'start':
        game.gameState.tick = 0;
        game.gameState.localStart = new Date().getTime();
        break;
      case 'spawn':
        const {x, y} = data;
        game.gameState.entities.push({x, y});
        break;
    }
  },

  COMMAND: (_, game) => {
    const message = {type: 'command', data: 'start'};

    game.channel.send(JSON.stringify(message));

    PROCESS_COMMAND(_, game, 'self', message);
    console.log('sent command');
  },

  CANVAS_CLICK: (_, game, event) => {
    const {x, y} = event,
          {clientWidth, width, clientHeight, height, offsetTop, offsetLeft} = event.target,
          message = {type: 'spawn', data: {x: (x - offsetLeft) / clientWidth * width  , y: (y - offsetTop) / (clientHeight) * height}};

    game.channel.send(JSON.stringify(message));

    PROCESS_COMMAND(_, game, 'self', message);

    console.log(event);
  }
};


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
          entities: []
        }
      }));

// jshint ignore:start
const Game = ({game}, {mutation}) => (
  <game>
    <span>Game</span>
    <Canvas game={game} onClick={mutation(CANVAS_CLICK, game)} />
    <button onClick={mutation(COMMAND, game)}>Start Game</button>
    <Messages messages={game.messages} />
  </game>
);
// jshint ignore:end

// jshint ignore:start
const Messages = ({messages}) => (
  <messages>
    {messages.map(({data, type}) => <span>{type}</span>)}
  </messages>
);
// jshint ignore:end

// jshint ignore:start
class Canvas extends Component {
  setCanvas(canvas) {
    this.canvas = canvas;
    this.canvasContext = this.canvasContext || canvas.getContext('2d');
    // console.log('canvas', canvas);
  }

  componentDidMount() {
    this.game = this.props.game;

    requestAnimationFrame(this.animate.bind(this))
  }

  animate() {
    this.canvasContext.fillStyle = 'rgb(0, 0, 0)';
    this.canvasContext.fillRect(0, 0, 500, 250);

    this.canvasContext.fillStyle = 'rgb(255, 255, 255)';
    this.game.gameState.entities.forEach(({x, y}) => {
      this.canvasContext.fillRect(x, y, 1, 1);
    })

    requestAnimationFrame(this.animate.bind(this));
  }

  render({game, onClick}) {
    return <canvas width="500" height="250" ref={this.setCanvas.bind(this)} onClick={onClick} />;
  }
}
// jshint ignore:end

export {Game, GAME_CHANNEL, GAME_CHANNEL_NAME};