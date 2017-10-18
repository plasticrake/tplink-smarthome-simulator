'use strict';

const defaultsDeep = require('lodash.defaultsdeep');

const lb100 = require('./lb100');

const lb130 = {
  colorTempRange: { min: 2500, max: 9000 },
  system: {
    sysinfo: {
      sw_ver: '1.6.0 Build 170703 Rel.141938',  // '1.2.1 Build 160928 Rel.141322' '1.5.5 Build 170623 Rel.090105'
      hw_ver: '1.0',
      model: 'LB130(US)',
      description: 'Smart Wi-Fi LED Bulb with Color Changing',

      is_dimmable: 1,
      is_color: 1,
      is_variable_color_temp: 1

    }
  }
};
defaultsDeep(lb130, lb100);

module.exports = lb130;
