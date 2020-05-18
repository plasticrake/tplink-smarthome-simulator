const defaultsDeep = require('lodash.defaultsdeep');

const lb100 = require('./lb100');

const lb120 = {
  colorTempRange: { min: 2700, max: 6500 },
  system: {
    sysinfo: {
      sw_ver: '1.1.0 Build 160630 Rel.085319',
      hw_ver: '1.0',
      model: 'LB120(US)',
      description: 'Smart Wi-Fi LED Bulb with Tunable White Light',

      is_dimmable: 1,
      is_color: 0,
      is_variable_color_temp: 1,
    },
  },
};
defaultsDeep(lb120, lb100);

module.exports = lb120;
