'use strict';

const base = require('./base');

const hs110v2 = Object.assign({}, base);
module.exports = hs110v2;

Object.assign(hs110v2, {
  system: {
    sysinfo: {
      sw_ver: '1.5.2 Build 180130 Rel.085820',
      hw_ver: '2.0',
      type: 'IOT.SMARTPLUGSWITCH',
      model: 'HS110(EU)',
      dev_name: 'Smart Wi-Fi Plug With Energy Monitoring',
      icon_hash: '',
      relay_state: 0,
      on_time: 0,
      active_mode: 'schedule',
      feature: 'TIM:ENE',
      updating: 0,
      rssi: -65,
      led_off: 0
    }
  }
});
