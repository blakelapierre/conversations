import {h} from 'preact-cycle';

const {
  CLEAR_PARTNERS
} = {
  CLEAR_PARTNERS: (_) => {
    _.partners = {};
    saveState({currentId: _.signaler.currentId, partners: _.partners});
  }
};

// jshint ignore:start
const Partners = ({CONNECT_TO_PARTNER}, {partners, mutation}) => (
  <partners>
    <div>Past Partners <button onClick={mutation(CLEAR_PARTNERS)}>clear</button></div>
    <ol>
      {Object.keys(partners).map(name => <li onClick={mutation(CONNECT_TO_PARTNER, name, mutation)}><Partner name={name} data={partners[name]} /></li>)}
    </ol>
  </partners>
);
// jshint ignore:end

// jshint ignore:start
const Partner = ({name, data}, {mutation}) => (
  <partner>
    {name}
  </partner>
);
// jshint ignore:end

export {Partners};