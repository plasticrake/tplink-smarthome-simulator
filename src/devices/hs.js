/* eslint-disable camelcase */
/* eslint-disable no-throw-literal */

'use strict';

const defaultsDeep = require('lodash.defaultsdeep');

const utils = require('../utils');
const errCode = utils.errCode;
const Base = require('./base');

const defaultData = require('./data/base');

class Hs extends Base {
  constructor (data = {}) {
    super(data);
    defaultsDeep(this.data, defaultData);

    this.api.system = {
      get_sysinfo: errCode(() => {
        this.data.system.sysinfo.on_time = this.onTime;
        return this.data.system.sysinfo;
      }),
      set_dev_alias: errCode(({alias}) => {
        this.alias = alias;
      }),
      set_relay_state: errCode(({state}) => {
        this.data.system.sysinfo.relay_state = state;
        this.onTime = new Date();
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
      reboot: errCode(({delay}) => {
        if (!Number.isInteger(delay)) {
          throw { err_code: -3, err_msg: 'invalid argument' };
        }
        return {};
      }),
      reset: errCode(({delay}) => {
        if (!Number.isInteger(delay)) {
          throw { err_code: -3, err_msg: 'invalid argument' };
        }
        return {};
      }),
      download_firmware: errCode(({url}) => { return {}; }),
      get_download_state: errCode(({url}) => { throw { err_code: -7, err_msg: 'unknown error' }; }),
      flash_firmware: errCode(({url}) => { throw { err_code: -5, err_msg: 'not enough memory' }; }),
      set_mac_addr: errCode(({mac}) => { this.mac = mac; }),
      set_device_id: errCode(({deviceId}) => { this.deviceId = deviceId; }),
      set_hw_id: errCode(({hwId}) => { this.hwId = hwId; }),
      test_check_uboot: errCode(() => { return this.data.system.test_check_uboot; }),
      set_test_mode: errCode(({enable}) => { return {}; }),
      get_dev_icon: errCode(() => { return this.data.system.dev_icon; }),
      set_dev_icon: errCode((data) => { this.data.system.dev_icon = data; })
    };

    this.api.cnCloud = {
      get_info: errCode(() => {
        return this.data.cnCloud.info;
      }),
      set_server_url: errCode(({server}) => { this.data.cnCloud.info.server = server; }),
      bind: errCode(({username, password}) => {
        this.data.cnCloud.info.username = username;
        this.data.cnCloud.info.binded = 1;
      }),
      unbind: errCode(() => {
        if (this.data.cnCloud.info.binded === 0) throw {'err_code': -4002, 'err_msg': "Device hasn't bound to any account yet"};
        this.data.cnCloud.info.username = '';
        this.data.cnCloud.info.binded = 0;
      }),
      get_intl_fw_list: errCode(() => { return {fw_list: []}; })
    };

    this.api.schedule = {
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
        this.data.schedule.rules.enable = enable;
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
    };

    this.api.anti_theft = {
      get_rules: errCode(() => {
        return this.data.anti_theft.rules;
      }),
      add_rule: errCode((rule) => {
        rule.id = utils.generateId(32);
        this.data.anti_theft.rules.rule_list.push(rule);
        return {id: rule.id};
      }),
      set_overall_enable: errCode(({enable}) => {
        this.data.anti_theft.rules.enable = enable;
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
    };

    this.api.count_down = {
      get_rules: errCode(() => {
        return this.data.count_down.rules;
      }),
      add_rule: errCode((rule) => {
        if (this.data.count_down.rules.rule_list.length > 0) {
          throw {err_code: -10, err_msg: 'table is full'};
        }
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
    };

    this.api.time = {
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
    };

    this.api.netif = {
      get_scaninfo: errCode(({refresh, timeout}) => {
        return this.data.netif.scaninfo;
      }),
      set_stainfo: errCode(({ssid, password, key_type}) => { return {}; })
    };

    this.api.emeter = {
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
    };

    this.onSince = new Date();
  }

  get onTime () {
    if (this.data.system.sysinfo.relay_state === 1) {
      return Math.round((Date.now() - this.onSince) / 1000); // in seconds
    } else {
      return 0;
    }
  }

  set onTime (value) {
    if (this.data.system.sysinfo.relay_state === 1) {
      this.onSince = value;
    }
  }
}

module.exports = Hs;
