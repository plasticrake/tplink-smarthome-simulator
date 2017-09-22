'use strict';

module.exports = {

  system: {
    sysinfo: {},
    test_check_uboot: {
      uboot: '100000FF00000000100000FD00000000100002220000000010000220000000001000021E000000001000021C000000001000021A000000001000021800000000'
    },
    dev_icon: { icon: '', hash: '' }
  },

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
    },
    get_vgain_igain: {
      vgain: 13255, igain: 16489
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
