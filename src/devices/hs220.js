'use strict';

const merge = require('lodash.merge');

const utils = require('../utils');
const errCode = utils.errCode;
const Hs200 = require('./hs200');

const defaultData = require('./data/hs220');

class Hs220 extends Hs200 {
  constructor (data) {
    super(data);
    merge(this.data, defaultData);

    this.api.netif.get_stainfo = errCode(() => {
      return Object.assign({}, this.data.netif.stainfo, { rssi: this.data.system.sysinfo.rssi });
    });

    this.api['smartlife.iot.dimmer'] = {
      set_switch_state: this.api.system.set_relay_state,

      set_brightness: errCode(({brightness}) => {
        this.data.system.sysinfo.brightness = brightness;
      }),

      set_dimmer_transition: errCode(({brightness, mode, duration}) => {
        this.data.system.sysinfo.brightness = brightness;
      }),

      get_dimmer_parameters: errCode(() => {
        return this.data.dimmer_parameters;
      }),

      get_default_behavior: errCode(() => {
        return this.data.default_behavior;
      })

    };
  }
}

module.exports = Hs220;
