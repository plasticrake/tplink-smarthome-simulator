'use strict';

const merge = require('lodash.merge');

const utils = require('../utils');
const errCode = utils.errCode;

const Hs110 = require('./hs110');

const defaultData = require('./data/hs110v2');

class Hs110v2 extends Hs110 {
  constructor (data) {
    super(data);
    merge(this.data, defaultData);

    this.api.emeter = {
      get_realtime: errCode(() => {
        let rt = this.data.emeter.realtime;
        return {
          voltage_mv: Math.floor(rt.voltage * 1000),
          current_ma: Math.floor(rt.current * 1000),
          power_mw: Math.floor(rt.power * 1000),
          total_wh: Math.floor(rt.total * 1000)
        };
      })
    };
  }
}

module.exports = Hs110v2;
