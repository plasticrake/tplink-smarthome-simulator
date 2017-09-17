/* eslint-disable camelcase */
'use strict';

const defaultsDeep = require('lodash.defaultsdeep');

const utils = require('../utils');
const errCode = utils.errCode;
const Hs = require('./hs');

const defaultData = require('./data/base');

class Lb extends Hs {
  constructor (data) {
    super(data);
    defaultsDeep(this.data, defaultData);

    this.api['smartlife.iot.common.cloud'] = {
      get_info: this.api.cnCloud.get_info
    };

    this.api['smartlife.iot.common.system'] = {
      set_dev_location: this.api.system.set_dev_location
    };

    this.api['smartlife.iot.common.schedule'] = {
      get_next_action: this.api.schedule.get_next_action,
      get_rules: this.api.schedule.get_rules,
      get_daystat: this.api.schedule.get_daystat
    };

    this.api['smartlife.iot.common.timesetting'] = {
      get_time: this.api.time.get_time,
      get_timezone: this.api.time.get_timezone
    };

    this.api['smartlife.iot.smartbulb.lightingservice'] = {
      get_light_state: errCode(() => {
        return this.data.system.sysinfo.light_state;
      }),
      get_light_details: errCode(() => {}),
      get_default_behavior: errCode(() => {}),
      transition_light_state: errCode(({on_off, brightness}) => {
        let ls = this.data.system.sysinfo.light_state;
        if (on_off != null) {
          Object.assign(ls, {on_off});
        }
        if (brightness != null) {
          Object.assign(ls, {brightness});
        }
        return ls;
      })
    };

    this.api['smartlife.iot.common.emeter'] = {
      get_daystat: this.data.emeter.get_daystat
    };

    this.api.emeter = {
      get_realtime: errCode(() => {
        throw { err_code: -2001, err_msg: 'Module not support' }; // eslint-disable-line no-throw-literal
      }),
      get_daystat: errCode(({year, month} = {}) => {
        throw { err_code: -2001, err_msg: 'Module not support' }; // eslint-disable-line no-throw-literal
      })
    };
  }
}

module.exports = Lb;
