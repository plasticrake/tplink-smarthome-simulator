const defaultsDeep = require('lodash.defaultsdeep');

const kl = require('./kl');

const kl430 = {
  colorTempRange: { min: 2500, max: 9000 },

  system: {
    sysinfo: {
      sw_ver: '1.0.9 Build 200305 Rel.090639',
      hw_ver: '1.0',
      mic_type: 'IOT.SMARTBULB',
      model: 'KL430(US)',
      deviceId: '801222BAA511374991036875D0A280AD1D35A16F',
      oemId: '1A3F21A5B9AE0ED6C80ED1A107885DB2',
      hwId: '375D4CCE7C909516CFD57BA93A304404',
      description: 'Kasa Smart Light Strip, Multicolor',
      length: 16,
      is_dimmable: 1,
      is_color: 1,
      is_variable_color_temp: 1,

      status: 'new',
      rssi: -58,

      is_factory: false,
      disco_ver: '1.0',

      ctrl_protocols: {
        name: 'Linkie',
        version: '1.0',
      },

      lighting_effect_state: {
        enable: 1,
        name: 'Aurora',
        custom: 0,
        id: 'xqUxDhbAhNLqulcuRMyPBmVGyTOyEMEu',
        brightness: 63,
      },

      dev_state: 'normal',
      active_mode: 'none',
      preferred_state: [],
    },
  },
};
defaultsDeep(kl430, kl);

module.exports = kl430;
