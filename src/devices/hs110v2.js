const merge = require('lodash.merge');

const Hs110 = require('./hs110');

const defaultData = require('./data/hs110v2');

class Hs110v2 extends Hs110 {
  constructor(data) {
    super(data);
    merge(this.data, defaultData);

    this.realtimeV2 = true;
  }
}

module.exports = Hs110v2;
