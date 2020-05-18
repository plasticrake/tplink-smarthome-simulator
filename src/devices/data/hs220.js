const hs = require('./hs');

const hs220 = { ...hs };
module.exports = hs220;

Object.assign(hs220, {
  system: {
    sysinfo: {
      sw_ver: '1.5.7 Build 180912 Rel.104837',
      hw_ver: '1.0',
      mic_type: 'IOT.SMARTPLUGSWITCH',
      model: 'HS220(US)',
      dev_name: 'Smart Wi-Fi Dimmer',
      icon_hash: '',
      relay_state: 0,
      brightness: 50,
      on_time: 0,
      active_mode: 'count_down',
      feature: 'TIM',
      updating: 0,
      rssi: -65,
      led_off: 0,

      preferred_state: [
        { index: 0, brightness: 100 },
        { index: 1, brightness: 75 },
        { index: 2, brightness: 50 },
        { index: 3, brightness: 25 },
      ],
    },
  },

  dimmer_parameters: {
    minThreshold: 0,
    fadeOnTime: 3000,
    fadeOffTime: 3000,
    gentleOnTime: 3000,
    gentleOffTime: 510000,
    rampRate: 30,
    bulb_type: 1,
  },

  default_behavior: {
    soft_on: { mode: 'last_status' },
    hard_on: { mode: 'last_status' },
    long_press: { mode: 'instant_on_off' },
    double_click: { mode: 'gentle_on_off' },
  },
});
