import { h } from 'preact-cycle';

const {
  ADD_LOG_MESSAGE
} = {
  ADD_LOG_MESSAGE: ({log}, message) => {
    log.unshift(message);
  }
};

// jshint ignore:start
const Console = (_, {log = []}) => (
  <console>
    <div>Log</div>
    <log>
      {log.map(message => <div>{message}</div>)}
    </log>
  </console>
);
// jshint ignore:end

export {Console, ADD_LOG_MESSAGE};