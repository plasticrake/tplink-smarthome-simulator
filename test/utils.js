/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */

const chai = require('chai');
chai.use(require('chai-things'));

const { expect } = chai;

const utils = require('../src/utils');

describe('utils', function () {
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
        utils
          .readJson(require.resolve('./fixtures/day_list.json'))
          .then((d) => {
            dayListData = d;
          }),
        utils
          .readJson(require.resolve('./fixtures/day_list.json'))
          .then((d) => {
            dayListDataOrig = d;
          }),
      ])
        .then(() => {
          done();
        })
        .catch((reason) => {
          done(reason);
        });
    });
    it('retrieve day list with existing data', function () {
      const dayList = utils.getDayList(2016, 12, 'energy', dayListData, 1.5);
      const dayListOrig = dayListDataOrig.filter((d) => d.month === 12);
      expect(dayList).to.have.lengthOf(31);
      expect(dayList).to.all.have.keys('year', 'month', 'day', 'energy');
      expect(dayList).to.eql(dayListOrig);
      expect(dayList).to.not.equal(dayListOrig);
    });
    it('generate day list for given month with no existing data', function () {
      const data = [];
      const dayList = utils.getDayList(2016, 1, 'energy', data, 1.5);
      expect(dayList).to.have.lengthOf(31);
      expect(dayList).to.all.have.keys('year', 'month', 'day', 'energy');
      expect(dayList).to.eql(data);
    });

    it('generate day list for given month and merge with existing data', function () {
      const data = dayListData.filter((d) => d.month === 12).slice(0, 15);
      expect(data).to.have.lengthOf(15);
      const dayList = utils.getDayList(2016, 12, 'energy', data, 1.5);
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
        utils
          .readJson(require.resolve('./fixtures/day_list.json'))
          .then((d) => {
            dayListData = d;
          }),
        utils
          .readJson(require.resolve('./fixtures/day_list.json'))
          .then((d) => {
            dayListDataOrig = d;
          }),
      ])
        .then(() => {
          done();
        })
        .catch((reason) => {
          done(reason);
        });
    });
    it('retrieve month list with existing data', function () {
      expect(dayListData).to.not.equal(dayListDataOrig);
      const data = dayListData;
      const monthList = utils.getMonthList(2016, 'energy', data, 1.5);
      expect(monthList).to.have.lengthOf(12);
      expect(monthList).to.all.have.keys('year', 'month', 'energy');
      expect(data).to.eql(dayListDataOrig);
      expect(data).to.not.equal(dayListDataOrig);
    });
    it('generate month list for given year with no existing data', function () {
      const data = [];
      const monthList = utils.getMonthList(2016, 'energy', data, 1.5);
      expect(monthList).to.have.lengthOf(12);
      expect(monthList).to.all.have.keys('year', 'month', 'energy');
      // Generated data for year was saved
      expect(data).to.have.lengthOf(366);
      expect(data).to.all.have.keys('year', 'month', 'day', 'energy');
    });
    it('generate month list for given year and merge with existing data', function () {
      const data = dayListData.slice(0, 180);
      expect(data).to.have.lengthOf(180);
      const monthList = utils.getMonthList(2016, 'energy', data, 1.5);
      expect(monthList).to.have.lengthOf(12);
      expect(monthList).to.all.have.keys('year', 'month', 'energy');
      // Generated data for year was saved
      expect(data).to.have.lengthOf(366);
      expect(data).to.all.have.keys('year', 'month', 'day', 'energy');
    });
  });

  describe('.parseJsonStream()', function () {
    it('set_dev_location', function () {
      expect(
        utils.parseJsonStream(
          '{"system":{"set_dev_alias":{"alias":"new name"}}}',
        ),
      ).to.eql([
        {
          name: 'system',
          methods: [{ name: 'set_dev_alias', args: { alias: 'new name' } }],
        },
      ]);
    });
    it('duplicate modules', function () {
      expect(
        utils.parseJsonStream(
          '{"system":{"get_sysinfo":{}},"system":{"get_sysinfo":{}}}',
        ),
      ).to.eql([
        {
          name: 'system',
          methods: [{ name: 'get_sysinfo', args: {} }],
        },
        {
          name: 'system',
          methods: [{ name: 'get_sysinfo', args: {} }],
        },
      ]);
    });
    it('duplicate methods', function () {
      expect(
        utils.parseJsonStream('{"system":{"get_sysinfo":{},"get_sysinfo":{}}}'),
      ).to.eql([
        {
          name: 'system',
          methods: [
            { name: 'get_sysinfo', args: {} },
            { name: 'get_sysinfo', args: {} },
          ],
        },
      ]);
    });
  });
});
