'use strict';

const base = require('./base');

const hs105 = Object.assign({}, base);
module.exports = hs105;

Object.assign(hs105, {
  system: {
    sysinfo: {
      sw_ver: '1.2.9 Build 170808 Rel.145916',
      hw_ver: '1.0',
      type: 'IOT.SMARTPLUGSWITCH',
      model: 'HS105(US)',
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
