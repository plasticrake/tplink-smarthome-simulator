'use strict';

const base = require('./base');

const hs100 = Object.assign({}, base);
module.exports = hs100;

Object.assign(hs100, {
  system: {
    sysinfo: {
      sw_ver: '1.0.8 Build 151113 Rel.24658',
      hw_ver: '1.0',
      type: 'IOT.SMARTPLUGSWITCH',
      model: 'HS100(US)',
      alias: 'Mock Device',
      dev_name: 'Wi-Fi Smart Plug',
      icon_hash: '',
      relay_state: 0,
      on_time: 0,
      active_mode: 'schedule',
      feature: 'TIM',
      updating: 0,
      rssi: -65,
      led_off: 0
    }
  }
});
