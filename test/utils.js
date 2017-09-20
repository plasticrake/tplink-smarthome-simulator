/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */

'use strict';

const chai = require('chai');
chai.use(require('chai-things'));
const expect = chai.expect;

const utils = require('../lib/utils');

describe('utils', function () {
  describe('.generateDayList()', function () {
    it('generate day list for given month', function () {
      let dayList = utils.generateDayList(2000, 1);
      expect(dayList).to.have.lengthOf(31);
      expect(dayList).to.have.all.have.keys('year', 'month', 'day');
    });
    it('generate day list for given month with callback data', function () {
      let dayList = utils.generateDayList(2000, 1, () => { return { time: 5 }; });
      expect(dayList).to.have.lengthOf(31);
      expect(dayList).to.have.all.have.keys('year', 'month', 'day', 'time');
      expect(dayList).to.have.all.have.property('time', 5);
    });
  });

  describe('.mergeDayLists()', function () {
    it('two lists with no common days should be combined', function () {
      let dayListTarget = utils.generateDayList(2000, 1);
      let dayListSource = utils.generateDayList(2001, 1);
      utils.mergeDayLists(dayListTarget, dayListSource);
      expect(dayListTarget).to.have.lengthOf(31 + 31);
      expect(dayListTarget).to.have.all.have.keys('year', 'month', 'day');
    });

    it('identical lists should stay the same', function () {
      let dayListTarget = utils.generateDayList(2000, 1);
      let dayListSource = utils.generateDayList(2000, 1);
      let originalDaylist = utils.generateDayList(2000, 1);
      utils.mergeDayLists(dayListTarget, dayListSource);
      expect(dayListTarget).to.have.lengthOf(31);
      expect(dayListTarget).to.have.all.have.keys('year', 'month', 'day');
      expect(originalDaylist).to.eql(dayListTarget);
    });
  });
});
