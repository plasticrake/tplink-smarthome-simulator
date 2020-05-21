"use strict";

/* eslint-disable camelcase */

/* eslint-disable no-throw-literal */
const defaultsDeep = require('lodash.defaultsdeep');

const utils = require('../utils');

const {
  errCode
} = utils;

const Base = require('./base');

const defaultData = require('./data/base');

class Hs extends Base {
  constructor(data = {}) {
    super(data);
    defaultsDeep(this.data, defaultData);
    this.api.system = {
      get_sysinfo: errCode(() => {
        return this.sysinfo;
      }),
      set_dev_alias: errCode(({
        alias
      }) => {
        this.alias = alias;
      }),
      set_relay_state: errCode(({
        state
      }) => {
        this.relayState = state;
        if (state == 1) this.onSince = new Date();
      }),
      set_dev_location: errCode(({
        longitude_i,
        latitude_i,
        latitude,
        longitude
      }) => {
        this.data.system.sysinfo.latitude = latitude;
        this.data.system.sysinfo.longitude = longitude;
        this.data.system.sysinfo.latitude_i = latitude_i;
        this.data.system.sysinfo.longitude_i = longitude_i;
      }),
      set_led_off: errCode(({
        off
      }) => {
        this.data.system.sysinfo.led_off = off;
      }),
      reboot: errCode(({
        delay
      }) => {
        if (!Number.isInteger(delay)) {
          throw {
            err_code: -3,
            err_msg: 'invalid argument'
          };
        }

        return {};
      }),
      reset: errCode(({
        delay
      }) => {
        if (!Number.isInteger(delay)) {
          throw {
            err_code: -3,
            err_msg: 'invalid argument'
          };
        }

        return {};
      }),
      // eslint-disable-next-line no-unused-vars
      download_firmware: errCode(({
        url
      }) => {
        return {};
      }),
      // eslint-disable-next-line no-unused-vars
      get_download_state: errCode(({
        url
      }) => {
        throw {
          err_code: -7,
          err_msg: 'unknown error'
        };
      }),
      // eslint-disable-next-line no-unused-vars
      flash_firmware: errCode(({
        url
      }) => {
        throw {
          err_code: -5,
          err_msg: 'not enough memory'
        };
      }),
      set_mac_addr: errCode(({
        mac
      }) => {
        this.mac = mac;
      }),
      set_device_id: errCode(({
        deviceId
      }) => {
        this.deviceId = deviceId;
      }),
      set_hw_id: errCode(({
        hwId
      }) => {
        this.hwId = hwId;
      }),
      test_check_uboot: errCode(() => {
        return this.data.system.test_check_uboot;
      }),
      // eslint-disable-next-line no-unused-vars
      set_test_mode: errCode(({
        enable
      }) => {
        return {};
      }),
      get_dev_icon: errCode(() => {
        return this.data.system.dev_icon;
      }),
      // eslint-disable-next-line no-shadow
      set_dev_icon: errCode(data => {
        this.data.system.dev_icon = data;
      })
    };
    this.api.cnCloud = {
      get_info: errCode(() => {
        return this.data.cnCloud.info;
      }),
      set_server_url: errCode(({
        server
      }) => {
        this.data.cnCloud.info.server = server;
      }),
      // eslint-disable-next-line no-unused-vars
      bind: errCode(({
        username,
        password
      }) => {
        this.data.cnCloud.info.username = username;
        this.data.cnCloud.info.binded = 1;
      }),
      unbind: errCode(() => {
        if (this.data.cnCloud.info.binded === 0) throw {
          err_code: -4002,
          err_msg: "Device hasn't bound to any account yet"
        };
        this.data.cnCloud.info.username = '';
        this.data.cnCloud.info.binded = 0;
      }),
      get_intl_fw_list: errCode(() => {
        return {
          fw_list: []
        };
      })
    };
    this.api.schedule = {
      get_next_action: errCode(() => {
        return this.scheduleContext.next_action;
      }),
      get_rules: errCode(() => {
        return this.scheduleContext.rules;
      }),
      add_rule: errCode(rule => {
        const newRule = { ...rule
        };
        newRule.id = utils.generateId(32);
        this.scheduleContext.rules.rule_list.push(newRule);
        return {
          id: newRule.id
        };
      }),
      set_overall_enable: errCode(({
        enable
      }) => {
        this.scheduleContext.rules.enable = enable;
      }),
      edit_rule: errCode(rule => {
        utils.editRule(this.scheduleContext.rules.rule_list, rule);
      }),
      delete_rule: errCode(({
        id
      }) => {
        utils.deleteRule(this.scheduleContext.rules.rule_list, id);
      }),
      delete_all_rules: errCode(() => {
        this.scheduleContext.rules.rule_list = [];
      }),
      get_daystat: errCode(({
        year,
        month
      }) => {
        const day_list = utils.getDayList(year, month, 'time', this.scheduleContext.daystat.day_list, () => {
          return utils.randomInt(0, 1440);
        });
        return {
          day_list
        };
      }),
      get_monthstat: errCode(({
        year
      }) => {
        const month_list = utils.getMonthList(year, 'time', this.scheduleContext.daystat.day_list, () => {
          return utils.randomInt(0, 1440);
        });
        return {
          month_list
        };
      }),
      erase_runtime_stat: errCode(() => {
        this.scheduleContext.daystat.day_list = [];
      })
    };
    this.api.anti_theft = {
      get_rules: errCode(() => {
        return this.antiTheftContext.rules;
      }),
      add_rule: errCode(rule => {
        const newRule = { ...rule
        };
        newRule.id = utils.generateId(32);
        this.antiTheftContext.rules.rule_list.push(newRule);
        return {
          id: newRule.id
        };
      }),
      set_overall_enable: errCode(({
        enable
      }) => {
        this.antiTheftContext.rules.enable = enable;
      }),
      edit_rule: errCode(rule => {
        utils.editRule(this.antiTheftContext.rules.rule_list, rule);
      }),
      delete_rule: errCode(({
        id
      }) => {
        utils.deleteRule(this.antiTheftContext.rules.rule_list, id);
      }),
      delete_all_rules: errCode(() => {
        this.antiTheftContext.rules.rule_list = [];
      })
    };
    this.api.count_down = {
      get_rules: errCode(() => {
        return this.countDownContext.rules;
      }),
      add_rule: errCode(rule => {
        const newRule = { ...rule
        };

        if (this.countDownContext.rules.rule_list.length > 0) {
          throw {
            err_code: -10,
            err_msg: 'table is full'
          };
        }

        newRule.id = utils.generateId(32);
        this.countDownContext.rules.rule_list.push(newRule);
        return {
          id: newRule.id
        };
      }),
      edit_rule: errCode(rule => {
        utils.editRule(this.countDownContext.rules.rule_list, rule);
      }),
      delete_rule: errCode(({
        id
      }) => {
        utils.deleteRule(this.countDownContext.rules.rule_list, id);
      }),
      delete_all_rules: errCode(() => {
        this.countDownContext.rules.rule_list = [];
      })
    };
    this.api.time = {
      get_time: errCode(() => {
        const d = new Date();
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
      set_timezone: errCode(() => {// TODO
        // {"year":2016,"month":1,"mday":1,"hour":10,"min":10,"sec":10,"index":42}
      })
    };
    this.api.netif = {
      // eslint-disable-next-line no-unused-vars
      get_scaninfo: errCode(({
        refresh,
        timeout
      }) => {
        return this.data.netif.scaninfo;
      }),
      // eslint-disable-next-line no-unused-vars
      set_stainfo: errCode(({
        ssid,
        password,
        key_type
      }) => {
        return {};
      })
    };
    this.api.emeter = {
      get_realtime: errCode(() => {
        if (this.realtimeV2) {
          const rt = this.emeterContext.realtime;
          return {
            voltage_mv: Math.floor(rt.voltage * 1000),
            current_ma: Math.floor(rt.current * 1000),
            power_mw: Math.floor(rt.power * 1000),
            total_wh: Math.floor(rt.total * 1000)
          };
        }

        return this.emeterContext.realtime;
      }),
      get_daystat: errCode(({
        year,
        month
      } = {}) => {
        let key;
        let defaultValue;

        if (this.realtimeV2) {
          key = 'energy_wh';

          defaultValue = () => {
            return utils.randomFloat(0, 30);
          };
        } else {
          key = 'energy';

          defaultValue = () => {
            return utils.randomInt(0, 30000);
          };
        }

        const day_list = utils.getDayList(year, month, key, this.emeterContext.daystat.day_list, defaultValue);
        return {
          day_list
        };
      }),
      get_monthstat: errCode(({
        year
      } = {}) => {
        let key;
        let defaultValue;

        if (this.realtimeV2) {
          key = 'energy_wh';

          defaultValue = () => {
            return utils.randomFloat(0, 30);
          };
        } else {
          key = 'energy';

          defaultValue = () => {
            return utils.randomInt(0, 30000);
          };
        }

        const month_list = utils.getMonthList(year, key, this.emeterContext.daystat.day_list, defaultValue);
        return {
          month_list
        };
      }),
      erase_emeter_stat: errCode(() => {
        this.emeterContext.daystat.day_list = [];
      }),
      get_vgain_igain: errCode(() => {
        return this.emeterContext.get_vgain_igain;
      }),
      set_vgain_igain: errCode(({
        vgain,
        igain
      }) => {
        this.emeterContext.get_vgain_igain.vgain = vgain;
        this.emeterContext.get_vgain_igain.igain = igain;
      }),
      // eslint-disable-next-line no-unused-vars
      start_calibration: errCode(({
        vtarget,
        itarget
      }) => {
        return {};
      })
    };
    this.onSince = new Date();
  } // eslint-disable-next-line class-methods-use-this


  get endSocketAfterResponse() {
    return true;
  }

  get sysinfo() {
    if (this.data.system.sysinfo.relay_state == 1) this.data.system.sysinfo.on_time = Math.round((Date.now() - this.onSince) / 1000);else this.data.system.sysinfo.on_time = 0;
    return this.data.system.sysinfo;
  }

  get relayState() {
    return this.data.system.sysinfo.relay_state;
  }

  set relayState(relayState) {
    var oldRelayState = this.data.system.sysinfo.relay_state;
    this.data.system.sysinfo.relay_state = relayState;
    if (oldRelayState == 0 && relayState == 1) this.onSince = new Date();
  }

  get antiTheftContext() {
    return this.data.anti_theft;
  }

  get countDownContext() {
    return this.data.count_down;
  }

  get onTime() {
    if (this.relay_state === 1) {
      return Math.round((Date.now() - this.onSince) / 1000); // in seconds
    } else {
      return 0;
    }
  }

  set onTime(value) {
    if (this.data.system.sysinfo.relay_state === 1) {
      this.onSince = value;
    }
  }

}

module.exports = Hs;