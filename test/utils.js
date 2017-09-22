/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */

'use strict';

const chai = require('chai');
chai.use(require('chai-things'));
const expect = chai.expect;

const utils = require('../lib/utils');

describe('utils', function () {
  // describe('.generateDayList()', function () {
  //   it('generate day list for given month', function () {
  //     let dayList = utils.generateDayList(2000, 1);
  //     expect(dayList).to.have.lengthOf(31);
  //     expect(dayList).to.have.all.have.keys('year', 'month', 'day');
  //   });
  //   it('generate day list for given month with callback data', function () {
  //     let dayList = utils.generateDayList(2000, 1, () => { return { time: 5 }; });
  //     expect(dayList).to.have.lengthOf(31);
  //     expect(dayList).to.have.all.have.keys('year', 'month', 'day', 'time');
  //     expect(dayList).to.have.all.have.property('time', 5);
  //   });
  // });

  describe('.getDayList()', function () {
    let dayListData;
    let dayListDataOrig;
    before(() => {
      chai.config.showDiff = false;
    });
    after(() => {
      chai.config.showDiff = true;
    });
    beforeEach((done) => {
      Promise.all([
        utils.readJson(require.resolve('./fixtures/day_list.json')).then((d) => { dayListData = d; }),
        utils.readJson(require.resolve('./fixtures/day_list.json')).then((d) => { dayListDataOrig = d; })
      ]).then(() => { done(); }).catch((reason) => { done(reason); });
    });
    it('retrieve day list with existing data', function () {
      let dayList = utils.getDayList(2016, 12, 'energy', dayListData, 1.5);
      let dayListOrig = dayListDataOrig.filter((d) => (d.month === 12));
      expect(dayList).to.have.lengthOf(31);
      expect(dayList).to.all.have.keys('year', 'month', 'day', 'energy');
      expect(dayList).to.eql(dayListOrig);
      expect(dayList).to.not.equal(dayListOrig);
    });
    it('generate day list for given month with no existing data', function () {
      let data = [];
      let dayList = utils.getDayList(2016, 1, 'energy', data, 1.5);
      expect(dayList).to.have.lengthOf(31);
      expect(dayList).to.all.have.keys('year', 'month', 'day', 'energy');
      expect(dayList).to.eql(data);
    });

    it('generate day list for given month and merge with existing data', function () {
      let data = dayListData.filter((d) => (d.month === 12)).slice(0, 15);
      expect(data).to.have.lengthOf(15);
      let dayList = utils.getDayList(2016, 12, 'energy', data, 1.5);
      expect(dayList).to.have.lengthOf(31);
      expect(dayList).to.all.have.keys('year', 'month', 'day', 'energy');
      expect(dayList).to.eql(data);
      expect(dayList).to.not.equal(data);
    });
  });

  describe('.getMonthList()', function () {
    let dayListData;
    let dayListDataOrig;
    before(() => {
      chai.config.showDiff = false;
    });
    after(() => {
      chai.config.showDiff = true;
    });
    beforeEach((done) => {
      Promise.all([
        utils.readJson(require.resolve('./fixtures/day_list.json')).then((d) => { dayListData = d; }),
        utils.readJson(require.resolve('./fixtures/day_list.json')).then((d) => { dayListDataOrig = d; })
      ]).then(() => { done(); }).catch((reason) => { done(reason); });
    });
    it('retrieve month list with existing data', function () {
      expect(dayListData).to.not.equal(dayListDataOrig);
      let data = dayListData;
      let monthList = utils.getMonthList(2016, 'energy', data, 1.5);
      expect(monthList).to.have.lengthOf(12);
      expect(monthList).to.all.have.keys('year', 'month', 'energy');
      expect(data).to.eql(dayListDataOrig);
      expect(data).to.not.equal(dayListDataOrig);
    });
    it('generate month list for given year with no existing data', function () {
      let data = [];
      let monthList = utils.getMonthList(2016, 'energy', data, 1.5);
      expect(monthList).to.have.lengthOf(12);
      expect(monthList).to.all.have.keys('year', 'month', 'energy');
      // Generated data for year was saved
      expect(data).to.have.lengthOf(366);
      expect(data).to.all.have.keys('year', 'month', 'day', 'energy');
    });
    it('generate month list for given year and merge with existing data', function () {
      let data = dayListData.slice(0, 180);
      expect(data).to.have.lengthOf(180);
      let monthList = utils.getMonthList(2016, 'energy', data, 1.5);
      expect(monthList).to.have.lengthOf(12);
      expect(monthList).to.all.have.keys('year', 'month', 'energy');
      // Generated data for year was saved
      expect(data).to.have.lengthOf(366);
      expect(data).to.all.have.keys('year', 'month', 'day', 'energy');
    });
  });

  // describe('.mergeDayLists()', function () {
  //   it('two lists with no common days should be combined', function () {
  //     let dayListTarget = utils.generateDayList(2000, 1);
  //     let dayListSource = utils.generateDayList(2001, 1);
  //     utils.mergeDayLists(dayListTarget, dayListSource);
  //     expect(dayListTarget).to.have.lengthOf(31 + 31);
  //     expect(dayListTarget).to.have.all.have.keys('year', 'month', 'day');
  //   });
  //
  //   it('identical lists should stay the same', function () {
  //     let dayListTarget = utils.generateDayList(2000, 1);
  //     let dayListSource = utils.generateDayList(2000, 1);
  //     let originalDaylist = utils.generateDayList(2000, 1);
  //     utils.mergeDayLists(dayListTarget, dayListSource);
  //     expect(dayListTarget).to.have.lengthOf(31);
  //     expect(dayListTarget).to.have.all.have.keys('year', 'month', 'day');
  //     expect(originalDaylist).to.eql(dayListTarget);
  //   });
  // });
});
