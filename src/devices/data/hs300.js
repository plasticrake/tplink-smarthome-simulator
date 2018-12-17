'use strict';

const hs = require('./hs');

const hs300 = Object.assign({}, hs);
module.exports = hs300;

Object.assign(hs300, {
  system: {
    sysinfo: {
      sw_ver: '1.0.6 Build 180627 Rel.081000',
      hw_ver: '1.0',
      model: 'HS300(US)',
      rssi: -68,
      mic_type: 'IOT.SMARTPLUGSWITCH',
      feature: 'TIM:ENE',
      updating: 0,
      led_off: 0,
      child_num: 6,
      children: null
    }
  },

  children: {
    '00': {
      sysinfo: {
        id: '00',
        state: 0,
        alias: 'Mock One',
        on_time: 0,
        next_action: { type: -1 }
      }
    },
    '01': {
      sysinfo: {
        id: '01',
        state: 0,
        alias: 'Mock Two',
        on_time: 0,
        next_action: { type: -1 }
      }
    },
    '02': {
      sysinfo: {
        id: '02',
        state: 0,
        alias: 'Mock Three',
        on_time: 0,
        next_action: { type: -1 }
      }
    },
    '03': {
      sysinfo: {
        id: '03',
        state: 0,
        alias: 'Mock Four',
        on_time: 0,
        next_action: { type: -1 }
      }
    },
    '04': {
      sysinfo: {
        id: '04',
        state: 0,
        alias: 'Mock Five',
        on_time: 0,
        next_action: { type: -1 }
      }
    },
    '05': {
      sysinfo: {
        id: '05',
        state: 0,
        alias: 'Mock Six',
        on_time: 0,
        next_action: { type: -1 }
      }
    }
  }
});
