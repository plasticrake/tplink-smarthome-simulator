'use strict';

const base = require('./base');

const lb = Object.assign({}, base);
module.exports = lb;

Object.assign(lb, {

  emeter: {
    realtime: {
      power_mw: 10800
    },
    daystat: {
      day_list: []
    }
  },

  'smartlife.iot.smartbulb.lightingservice': {
    get_light_details: {
      lamp_beam_angle: 150,
      min_voltage: 110,
      max_voltage: 120,
      wattage: 10,
      incandescent_equivalent: 60,
      max_lumens: 800,
      color_rendering_index: 80
    },
    get_default_behavior: {
      soft_on: {
        mode: 'last_status'
      },
      hard_on: {
        mode: 'last_status'
      },
      err_code: 0
    }
  }

});
