'use strict';

const defaultsDeep = require('lodash.defaultsdeep');

const Hs = require('./hs');

const defaultData = require('./data/hs110');

class Hs110 extends Hs {
  constructor (data) {
    super(data);
    defaultsDeep(this.data, defaultData);
  }
}

module.exports = Hs110;
