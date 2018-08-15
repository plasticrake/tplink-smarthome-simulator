'use strict';

const base = require('./base');

const hs110 = Object.assign({}, base);
module.exports = hs110;

Object.assign(hs110, {
  system: {
    sysinfo: {
      sw_ver: '1.0.8 Build 151113 Rel.24658',
      hw_ver: '1.0',
      type: 'IOT.SMARTPLUGSWITCH',
      model: 'HS110(US)',
      dev_name: 'Wi-Fi Smart Plug With Energy Monitoring',
      icon_hash: '',
      relay_state: 0,
      on_time: 0,
      active_mode: 'schedule',
      feature: 'TIM:ENE',
      updating: 0,
      rssi: -65,
      led_off: 0
    }
  },

  emeter: {
    realtime: {
      current: 0.1256,
      voltage: 122.049119,
      power: 3.14,
      total: 51.493
    }
  }
});
