const hs = require('./hs');

const hs100 = { ...hs };
module.exports = hs100;

Object.assign(hs100, {
  system: {
    sysinfo: {
      sw_ver: '1.2.5 Build 171129 Rel.174814',
      hw_ver: '1.0',
      type: 'IOT.SMARTPLUGSWITCH',
      model: 'HS100(US)',
      dev_name: 'Wi-Fi Smart Plug',
      icon_hash: '',
      relay_state: 0,
      on_time: 0,
      active_mode: 'schedule',
      feature: 'TIM',
      updating: 0,
      rssi: -65,
      led_off: 0,
    },
  },
});
