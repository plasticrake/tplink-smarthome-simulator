/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */

'use strict';

const chai = require('chai');
const expect = chai.expect;

const logger = require('../lib/logger');

describe('Logger', function () {
  describe('constructor()', function () {
    it('defaults to info level', function () {
      expect(logger().getLevel()).to.eql(logger().levels.INFO);
    });
  });
});
