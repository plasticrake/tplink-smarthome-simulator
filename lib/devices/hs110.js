/* eslint-disable camelcase */
'use strict';

const defaultsDeep = require('lodash.defaultsdeep');

const utils = require('../utils');
const errCode = utils.errCode;
const Hs = require('./hs');

const defaultData = require('./data/hs110');

class Hs110 extends Hs {
  constructor (data) {
    super(data);
    defaultsDeep(this.data, defaultData);

    this.api.emeter = {

      get_realtime: errCode(() => {
        return this.data.emeter.realtime;
      }),

      get_daystat: errCode(({year, month} = {}) => {
        let day_list = this.data.emeter.daystat.day_list.filter((s) => {
          if ((s.year === year || year != null) && (s.month === month || month != null)) {
            return true;
          }
        });
        if (year != null && month != null) {
          let genData = utils.generateDayList(year, month, () => { return { time: utils.randomFloat(0, 10) }; });
          day_list = utils.mergeDayLists(genData, day_list);
        }
        return {day_list};
      })

    };
  }
}

module.exports = Hs110;
