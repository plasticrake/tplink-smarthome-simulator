const defaultsDeep = require('lodash.defaultsdeep');

const Lb = require('./lb');

const defaultData = require('./data/lb130');

class Lb130 extends Lb {
  constructor(data) {
    super(data);
    defaultsDeep(this.data, defaultData);
  }
}

module.exports = Lb130;
