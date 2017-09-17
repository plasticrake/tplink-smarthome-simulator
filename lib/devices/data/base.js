'use strict';

module.exports = {

  system: { sysinfo: {} },

  cnCloud: {
    info: {
      username: '',
      server: 'devs.tplinkcloud.com',
      binded: 0,
      cld_connection: 1,
      illegalType: 0,
      stopConnect: 0,
      tcspStatus: 1,
      fwDlPage: '',
      tcspInfo: '',
      fwNotifyType: 0
    }
  },

  emeter: {
    realtime: {
      current: 0.1256,
      voltage: 122.049119,
      power: 3.14,
      total: 51.493
    },
    daystat: {
      day_list: []
    }
  },

  schedule: {
    next_action: { type: -1 },
    rules: { enable: 1, rule_list: [] },
    daystat: {
      day_list: []
    }
  },

  anti_theft: {
    rules: { enable: 0, rule_list: [] }
  },

  count_down: {
    rules: { rule_list: [] }
  },

  time: {
    time: {
      offset: 0
    },
    timezone: {
      index: 6,
      zone_str: '(UTC-08:00) Pacific Daylight Time (US & Canada)',
      tz_str: 'PST8PDT,M3.2.0,M11.1.0',
      dst_offset: 60
    }
  },

  netif: {
    scaninfo: {
      ap_list: [
           { ssid: 'wifi_network_1', key_type: 1 },
           { ssid: 'wifi_network_2', key_type: 2 },
           { ssid: 'wifi_network_3', key_type: 3 }
      ]
    }
  }

};
