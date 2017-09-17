'use strict';

const defaultsDeep = require('lodash.defaultsdeep');

const Hs = require('./hs');

const defaultData = require('./data/hs100');

class Hs100 extends Hs {
  constructor (data) {
    super(data);
    defaultsDeep(this.data, defaultData);
  }
}

module.exports = Hs100;
