const hs = require('./hs');

const hs220 = { ...hs };
module.exports = hs220;

Object.assign(hs220, {
  system: {
    sysinfo: {
      sw_ver: '1.1.0 Build 160521 Rel.085826',
      hw_ver: '1.0',
      type: 'IOT.SMARTPLUGSWITCH',
      model: 'HS200(US)',
      dev_name: 'Wi-Fi Smart Light Switch',
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
