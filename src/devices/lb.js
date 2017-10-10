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

    this.api['system'] = this.hs.api.system;

    this.api['smartlife.iot.common.system'] = this.hs.api.system;

    this.api['smartlife.iot.common.cloud'] = this.hs.api.cnCloud;

    this.api['smartlife.iot.common.schedule'] = this.hs.api.schedule;

    this.api['smartlife.iot.common.timesetting'] = this.hs.api.time;

    this.api['smartlife.iot.common.timesetting'].set_time = errCode(({year, month, mday, hour, min, sec}) => {
      // TODO
    });

    this.api['netif'] = this.hs.api.netif;

    this.api['smartlife.iot.common.emeter'] = {
      get_realtime: errCode(() => {
        return this.data.emeter.realtime;
      }),
      get_daystat: errCode(({year, month} = {}) => {
        let day_list = utils.getDayList(year, month, 'energy_wh', this.data.emeter.daystat.day_list, () => { return utils.randomInt(0, 30); });
        return {day_list};
      }),
      get_monthstat: errCode(({year} = {}) => {
        let month_list = utils.getMonthList(year, 'energy_wh', this.data.emeter.daystat.day_list, () => { return utils.randomInt(0, 30); });
        return {month_list};
      })
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
          switch (k) {
            case 'color_temp':
              if ((v >= this.data.colorTempRange.min && v <= this.data.colorTempRange.max)) {
                Object.assign(ls, {[k]: v});
              } else {
                throw { err_code: -10000, err_msg: 'Invalid input argument' }; // eslint-disable-line no-throw-literal
              }
              break;
            case 'mode':
            case 'hue':
            case 'on_off':
            case 'saturation':
            case 'brightness':
              Object.assign(ls, {[k]: v});
              break;
          }
        });

        // "ignore_default": 1,
        // "transition_period": 150,

        return ls;
      })
    };
  }
}

module.exports = Lb;
