'use strict';

const defaultsDeep = require('lodash.defaultsdeep');

const Lb = require('./lb');

const defaultData = require('./data/lb100');

class Lb100 extends Lb {
  constructor (data) {
    super(data);
    defaultsDeep(this.data, defaultData);
  }
}

module.exports = Lb100;
