'use strict';

const defaultsDeep = require('lodash.defaultsdeep');

const Hs = require('./hs');

const defaultData = require('./data/hs105');

class Hs105 extends Hs {
  constructor (data) {
    super(data);
    defaultsDeep(this.data, defaultData);
  }
}

module.exports = Hs105;
