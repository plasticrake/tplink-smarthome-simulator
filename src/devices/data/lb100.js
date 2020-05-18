const defaultsDeep = require('lodash.defaultsdeep');

const lb = require('./lb');

const lb100 = {
  system: {
    sysinfo: {
      sw_ver: '1.4.3 Build 170504 Rel.144921',
      hw_ver: '1.0',
      mic_type: 'IOT.SMARTBULB', // type
      model: 'LB100(US)',
      description: 'Smart Wi-Fi LED Bulb with Dimmable Light', // dev_name
      active_mode: 'none',
      rssi: -65,

      dev_state: 'normal',
      heapsize: 302452,
      is_factory: false,
      disco_ver: '1.0',

      is_dimmable: 1,
      is_color: 0,
      is_variable_color_temp: 0,

      ctrl_protocols: {
        name: 'Linkie',
        version: '1.0',
      },

      light_state: {
        on_off: 0,
        dft_on_state: {
          mode: 'normal',
          hue: 0,
          saturation: 0,
          color_temp: 2700,
          brightness: 100,
        },
      },

      preferred_state: [
        {
          index: 0,
          hue: 0,
          saturation: 0,
          color_temp: 2700,
          brightness: 100,
        },
        {
          index: 1,
          hue: 0,
          saturation: 0,
          color_temp: 2700,
          brightness: 75,
        },
        {
          index: 2,
          hue: 0,
          saturation: 0,
          color_temp: 2700,
          brightness: 25,
        },
        {
          index: 3,
          hue: 0,
          saturation: 0,
          color_temp: 2700,
          brightness: 1,
        },
      ],
    },
  },
};

defaultsDeep(lb100, lb);

module.exports = lb100;
