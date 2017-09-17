/* eslint-disable camelcase */
'use strict';

const defaultsDeep = require('lodash.defaultsdeep');

const utils = require('../utils');
const errCode = utils.errCode;

const defaultData = require('./data/base');

class Hs {
  constructor (data = {}) {
    this.data = defaultsDeep(data, defaultData);
    let si = data.system.sysinfo;
    if (data.name) {
      si.name = data.name;
    }
    if (data.mac) {
      si.mac = data.mac;
    }
    if (data.deviceId) {
      si.deviceId = data.deviceId;
    }
    if (!si.mac) { si.mac = utils.randomMac(); }
    if (!si.mic_mac) { si.mic_mac = si.mac; }
    if (!si.deviceId) { si.deviceId = utils.generateId(40); }
    if (!si.hwId) { si.hwId = utils.generateId(32); }
    if (!si.fwId) { si.fwId = utils.generateId(32); }
    if (!si.oemId) { si.oemId = utils.generateId(32); }
    if (!si.latitude) { si.latitude = utils.randomLatitude(); }
    if (!si.latitude_i) { si.latitude_i = Math.round(si.latitude * 10000); }
    if (!si.longitude) { si.longitude = utils.randomLongitude(); }
    if (!si.longitude_i) { si.longitude_i = Math.round(si.longitude * 10000); }

    this.api = {
      system: {
        get_sysinfo: errCode(() => {
          return this.data.system.sysinfo;
        }),
        set_dev_alias: errCode(({alias}) => {
          this.data.system.sysinfo.alias = alias;
        }),
        set_relay_state: errCode(({state}) => {
          this.data.system.sysinfo.relay_state = state;
        }),
        set_dev_location: errCode(({longitude_i, latitude_i, latitude, longitude}) => {
          this.data.system.sysinfo.latitude = latitude;
          this.data.system.sysinfo.longitude = longitude;
          this.data.system.sysinfo.latitude_i = latitude_i;
          this.data.system.sysinfo.longitude_i = longitude_i;
        }),
        set_led_off: errCode(({off}) => {
          this.data.system.sysinfo.led_off = off;
        })
      },
      cnCloud: {
        get_info: errCode(() => {
          return this.data.cnCloud.info;
        })
      },
      schedule: {
        get_next_action: errCode(() => {
          return this.data.schedule.next_action;
        }),
        get_rules: errCode(() => {
          return this.data.schedule.rules;
        }),
        get_daystat: errCode(({year, month} = {}) => {
          let day_list = this.data.schedule.daystat.day_list.filter((s) => {
            if ((s.year === year || year != null) && (s.month === month || month != null)) {
              return true;
            }
          });
          if (year != null && month != null) {
            let genData = utils.generateDayList(year, month, () => { return { time: utils.randomInt(0, 1000) }; });
            day_list = utils.mergeDayLists(genData, day_list);
          }
          return {day_list};
        })
      },
      anti_theft: {
        get_rules: errCode(() => {
          return this.data.anti_theft.rules;
        })
      },
      count_down: {
        get_rules: errCode(() => {
          return this.data.count_down.rules;
        })
      },
      emeter: {
        get_realtime: errCode(() => {
          throw 'module not support'; // eslint-disable-line no-throw-literal
        }),
        get_daystat: errCode(({year, month} = {}) => {
          throw 'module not support'; // eslint-disable-line no-throw-literal
        })
      },
      time: {
        get_time: errCode(() => {
          let d = new Date();
          return {
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            mday: d.getDate(),
            wday: d.getDay(),
            hour: d.getHours(),
            min: d.getMinutes(),
            sec: d.getSeconds()
          };
        }),
        get_timezone: errCode(() => {
          return this.data.time.timezone;
        })
      },
      netif: {
        get_scaninfo: errCode(({refresh, timeout}) => {
          return this.data.netif.scaninfo;
        })
      }
    };
  }
}

module.exports = Hs;
