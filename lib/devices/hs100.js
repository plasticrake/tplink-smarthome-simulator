'use strict';

const defaultsDeep = require('lodash.defaultsdeep');

const utils = require('../utils');
const errCode = utils.errCode;
const Hs = require('./hs');

const defaultData = require('./data/hs100');

class Hs100 extends Hs {
  constructor (data) {
    super(data);
    defaultsDeep(this.data, defaultData);

    this.api.emeter = {
      get_realtime: errCode(() => {
        throw 'module not support'; // eslint-disable-line no-throw-literal
      }),
      get_daystat: errCode(({year, month} = {}) => {
        throw 'module not support'; // eslint-disable-line no-throw-literal
      })
    };
  }
}

module.exports = Hs100;
