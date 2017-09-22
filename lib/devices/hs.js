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
    if (data.alias) {
      si.alias = data.alias;
    } else {
      si.alias = 'Mock Device';
    }
    if (data.mac) {
      this.setMac(data.mac);
    }
    if (data.deviceId) {
      si.deviceId = data.deviceId;
    }

    if (!si.mac && !si.mic_mac) { this.setMac(utils.randomMac()); }
    if (!si.deviceId) { si.deviceId = utils.generateId(40); }
    if (!si.hwId) { si.hwId = utils.generateId(32); }
    if (!si.fwId) { si.fwId = utils.generateId(32); }
    if (!si.oemId) { si.oemId = utils.generateId(32); }
    if (!si.latitude) { si.latitude = utils.randomLatitude(); }
    if (!si.latitude_i) { si.latitude_i = Math.round(si.latitude * 10000); }
    if (!si.longitude) { si.longitude = utils.randomLongitude(); }
    if (!si.longitude_i) { si.longitude_i = Math.round(si.longitude * 10000); }

    let setOnSince = () => {
      if (si.relay_state === 1) {
        this.onSince = Date.now();
      }
    };

    let getOnSince = () => {
      if (si.relay_state === 1) {
        return Math.round((Date.now() - this.onSince) / 1000); // in seconds
      } else {
        return 0;
      }
    };

    setOnSince();

    this.api = {
      system: {
        get_sysinfo: errCode(() => {
          this.data.system.sysinfo.on_time = getOnSince();
          return this.data.system.sysinfo;
        }),
        set_dev_alias: errCode(({alias}) => {
          this.data.system.sysinfo.alias = alias;
        }),
        set_relay_state: errCode(({state}) => {
          this.data.system.sysinfo.relay_state = state;
          setOnSince();
        }),
        set_dev_location: errCode(({longitude_i, latitude_i, latitude, longitude}) => {
          this.data.system.sysinfo.latitude = latitude;
          this.data.system.sysinfo.longitude = longitude;
          this.data.system.sysinfo.latitude_i = latitude_i;
          this.data.system.sysinfo.longitude_i = longitude_i;
        }),
        set_led_off: errCode(({off}) => {
          this.data.system.sysinfo.led_off = off;
        }),
        reboot: errCode(({delay}) => { return {}; }),
        reset: errCode(({delay}) => { return {}; }),
        download_firmware: errCode(({url}) => { return {}; }),
        get_download_state: errCode(({url}) => { throw { err_code: -7, err_msg: 'unknown error' }; }),  // eslint-disable-line no-throw-literal
        flash_firmware: errCode(({url}) => { throw { err_code: -5, err_msg: 'not enough memory' }; }),  // eslint-disable-line no-throw-literal
        set_mac_addr: errCode(({mac}) => { this.setMac(mac); }),
        set_device_id: errCode(({deviceId}) => { this.data.system.sysinfo.deviceId = deviceId; }),
        set_hw_id: errCode(({hwId}) => { this.data.system.sysinfo.hwId = hwId; }),
        test_check_uboot: errCode(() => { return this.data.system.test_check_uboot; }),
        set_test_mode: errCode(({enable}) => { return {}; }),
        get_dev_icon: errCode(() => { return this.data.system.dev_icon; }),
        set_dev_icon: errCode((data) => { this.data.system.dev_icon = data; })

      },
      cnCloud: {
        get_info: errCode(() => {
          return this.data.cnCloud.info;
        }),
        set_server_url: errCode(({server}) => { this.data.cnCloud.info.server = server; }),
        bind: errCode(({username, password}) => {
          this.data.cnCloud.info.username = username;
          this.data.cnCloud.info.binded = 1;
        }),
        unbind: errCode(() => {
          this.data.cnCloud.info.username = '';
          this.data.cnCloud.info.binded = 0;
        }),
        get_intl_fw_list: errCode(() => { return {fw_list: []}; })
      },

      schedule: {
        get_next_action: errCode(() => {
          return this.data.schedule.next_action;
        }),
        get_rules: errCode(() => {
          return this.data.schedule.rules;
        }),
        add_rule: errCode((rule) => {
          rule.id = utils.generateId(32);
          this.data.schedule.rules.rule_list.push(rule);
          return {id: rule.id};
        }),
        set_overall_enable: errCode(({enable}) => {
          this.data.schedule.rules.enabble = enable;
        }),
        edit_rule: errCode((rule) => {
          utils.editRule(this.data.schedule.rules.rule_list, rule);
        }),
        delete_rule: errCode(({id}) => {
          utils.deleteRule(this.data.schedule.rules.rule_list, id);
        }),
        delete_all_rules: errCode(() => {
          this.data.schedule.rules.rule_list = [];
        }),
        get_daystat: errCode(({year, month}) => {
          let day_list = utils.getDayList(year, month, 'time', this.data.schedule.daystat.day_list, () => { return utils.randomInt(0, 1440); });
          return {day_list};
        }),
        get_monthstat: errCode(({year}) => {
          let month_list = utils.getMonthList(year, 'time', this.data.schedule.daystat.day_list, () => { return utils.randomInt(0, 1440); });
          return {month_list};
        }),
        erase_runtime_stat: errCode(() => {
          this.data.schedule.daystat.day_list = [];
        })

      },
      anti_theft: {
        get_rules: errCode(() => {
          return this.data.anti_theft.rules;
        }),
        add_rule: errCode((rule) => {
          rule.id = utils.generateId(32);
          this.data.anti_theft.rules.rule_list.push(rule);
          return {id: rule.id};
        }),
        set_overall_enable: errCode(({enable}) => {
          this.data.anti_theft.rules.enabble = enable;
        }),
        edit_rule: errCode((rule) => {
          utils.editRule(this.data.anti_theft.rules.rule_list, rule);
        }),
        delete_rule: errCode(({id}) => {
          utils.deleteRule(this.data.anti_theft.rules.rule_list, id);
        }),
        delete_all_rules: errCode(() => {
          this.data.anti_theft.rules.rule_list = [];
        })
      },
      count_down: {
        get_rules: errCode(() => {
          return this.data.count_down.rules;
        }),
        add_rule: errCode((rule) => {
          rule.id = utils.generateId(32);
          this.data.count_down.rules.rule_list.push(rule);
          return {id: rule.id};
        }),
        edit_rule: errCode((rule) => {
          utils.editRule(this.data.count_down.rules.rule_list, rule);
        }),
        delete_rule: errCode(({id}) => {
          utils.deleteRule(this.data.count_down.rules.rule_list, id);
        }),
        delete_all_rules: errCode(() => {
          this.data.count_down.rules.rule_list = [];
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
        }),
        set_timezone: errCode(() => {
          // TODO
          // {"year":2016,"month":1,"mday":1,"hour":10,"min":10,"sec":10,"index":42}
        })
      },
      netif: {
        get_scaninfo: errCode(({refresh, timeout}) => {
          return this.data.netif.scaninfo;
        }),
        set_stainfo: errCode(({ssid, password, key_type}) => { return {}; })
      },
      emeter: {
        get_realtime: errCode(() => {
          return this.data.emeter.realtime;
        }),
        get_daystat: errCode(({year, month} = {}) => {
          let day_list = utils.getDayList(year, month, 'energy', this.data.emeter.daystat.day_list, () => { return utils.randomFloat(0, 30); });
          return {day_list};
        }),
        get_monthstat: errCode(({year} = {}) => {
          let month_list = utils.getMonthList(year, 'energy', this.data.emeter.daystat.day_list, () => { return utils.randomFloat(0, 30); });
          return {month_list};
        }),
        erase_emeter_stat: errCode(() => {
          this.data.emeter.daystat.day_list = [];
        }),
        get_vgain_igain: errCode(() => {
          return this.data.emeter.get_vgain_igain;
        }),
        set_vgain_igain: errCode(({vgain, igain}) => {
          this.data.emeter.get_vgain_igain.vgain = vgain;
          this.data.emeter.get_vgain_igain.igain = igain;
        }),
        start_calibration: errCode(({vtarget, itarget}) => {
          return {};
        })
      }
    };
  }
  setMac (mac) {
    this.data.system.sysinfo.mac = mac;
    this.data.system.sysinfo.mic_mac = mac.replace(/[^A-Za-z0-9]/g, '');
  }
}

module.exports = Hs;
