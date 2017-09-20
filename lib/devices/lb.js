/* eslint-disable camelcase */
'use strict';

const defaultsDeep = require('lodash.defaultsdeep');

const utils = require('../utils');
const errCode = utils.errCode;
const Hs = require('./hs');

const defaultData = require('./data/base');

if (!Object.entries) {
  Object.entries = function (obj) {
    var ownProps = Object.keys(obj);
    var i = ownProps.length;
    var resArray = new Array(i); // preallocate the Array
    while (i--) {
      resArray[i] = [ownProps[i], obj[ownProps[i]]];
    }

    return resArray;
  };
}

class Lb {
  constructor (data) {
    this.hs = new Hs(data);
    this.data = defaultsDeep(data, defaultData);

    this.api = {};

    this.api['system'] = {
      get_sysinfo: this.hs.api.system.get_sysinfo
    };

    this.api['smartlife.iot.common.cloud'] = {
      get_info: this.hs.api.cnCloud.get_info
    };

    this.api['smartlife.iot.common.system'] = {
      get_sysinfo: this.hs.api.system.get_sysinfo,
      set_dev_alias: this.hs.api.system.set_dev_alias,
      set_dev_location: this.hs.api.system.set_dev_location
    };

    this.api['smartlife.iot.common.schedule'] = {
      get_next_action: this.hs.api.schedule.get_next_action,
      get_rules: this.hs.api.schedule.get_rules,
      get_daystat: this.hs.api.schedule.get_daystat
    };

    this.api['smartlife.iot.common.timesetting'] = {
      get_time: this.hs.api.time.get_time,
      get_timezone: this.hs.api.time.get_timezone
    };

    this.api['netif'] = {
      get_scaninfo: this.hs.api.netif.get_scaninfo
    };
    this.api['smartlife.iot.smartbulb.lightingservice'] = {
      get_light_state: errCode(() => {
        return this.data.system.sysinfo.light_state;
      }),
      get_light_details: errCode(() => {
        return this.data['smartlife.iot.smartbulb.lightingservice'].get_light_details;
      }),
      get_default_behavior: errCode(() => {
        return this.data['smartlife.iot.smartbulb.lightingservice'].get_default_behavior;
      }),

      transition_light_state: errCode((options) => {
        let ls = this.data.system.sysinfo.light_state;

        Object.entries(options).forEach(([k, v]) => {
          if (['mode', 'hue', 'on_off', 'saturation', 'color_temp', 'brightness'].includes(k)) {
            Object.assign(ls, {[k]: v});
          }
        });

        // "ignore_default": 1,
        // "transition_period": 150,

        return ls;
      })
    };

    this.api['smartlife.iot.common.emeter'] = {
      get_daystat: errCode((...args) => {
        let ds = this.hs.api.emeter.get_daystat(...args);
        ds.day_list = ds.day_list.map((o) => { return {year: o.year, month: o.month, day: o.day, energy_wh: o.energy}; });
        return ds;
      })
    };

    // this.api.emeter = {
    //   get_realtime: errCode(() => {
    //     throw { err_code: -2001, err_msg: 'Module not support' }; // eslint-disable-line no-throw-literal
    //   }),
    //   get_daystat: errCode(() => {
    //     throw { err_code: -2001, err_msg: 'Module not support' }; // eslint-disable-line no-throw-literal
    //   })
    // };
  }
}

module.exports = Lb;
