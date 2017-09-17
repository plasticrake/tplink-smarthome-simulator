/* eslint-env mocha */

'use strict';

const chai = require('chai');
chai.use(require('chai-things'));
chai.should();

const utils = require('../lib/utils');

describe('utils', function () {
  describe('.generateDayList()', function () {
    it('generate day list for given month', function () {
      let dayList = utils.generateDayList(2000, 1);
      dayList.should.have.lengthOf(31);
      dayList.should.all.have.keys('year', 'month', 'day');
    });
    it('generate day list for given month with callback data', function () {
      let dayList = utils.generateDayList(2000, 1, () => { return { time: 5 }; });
      dayList.should.have.lengthOf(31);
      dayList.should.all.have.keys('year', 'month', 'day', 'time');
      dayList.should.all.have.property('time', 5);
    });
  });

  describe('.mergeDayLists()', function () {
    it('two lists with no common days should be combined', function () {
      let dayListTarget = utils.generateDayList(2000, 1);
      let dayListSource = utils.generateDayList(2001, 1);
      utils.mergeDayLists(dayListTarget, dayListSource);
      dayListTarget.should.have.lengthOf(31 + 31);
      dayListTarget.should.all.have.keys('year', 'month', 'day');
    });

    it('identical lists should stay the same', function () {
      let dayListTarget = utils.generateDayList(2000, 1);
      let dayListSource = utils.generateDayList(2000, 1);
      let originalDaylist = utils.generateDayList(2000, 1);
      utils.mergeDayLists(dayListTarget, dayListSource);
      dayListTarget.should.have.lengthOf(31);
      dayListTarget.should.all.have.keys('year', 'month', 'day');
      originalDaylist.should.eql(dayListTarget);
    });
  });
});
