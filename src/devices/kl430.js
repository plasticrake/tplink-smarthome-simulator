const defaultsDeep = require('lodash.defaultsdeep');

const Kl = require('./kl');

const defaultData = require('./data/kl430');

class Kl430 extends Kl {
  constructor(data) {
    super(data);
    this.data.cnCloud = defaultData.cnCloud;
    defaultsDeep(this.data, defaultData);
  }
}

module.exports = Kl430;
