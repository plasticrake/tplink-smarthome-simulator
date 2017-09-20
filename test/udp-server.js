/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */

'use strict';

const chai = require('chai');
const expect = chai.expect;

const UdpServer = require('..').UdpServer;

describe('UdpServer', function () {
  before(function () {
    UdpServer.log.disableAll();
  });

  describe('.log', function () {
    it('has log', function () {
      expect(UdpServer.log).to.exist;
    });
  });
  describe('.start()', function () {
    it('defaults', function () {
      return UdpServer.start().then(() => {
        expect(UdpServer.socket.address().port).to.eql(9999);
      });
    });
    it('opens socket', function () {
      return UdpServer.start().then(() => {
        expect(UdpServer.socketBound).to.be.true;
      });
    });
  });
  describe('.stop()', function () {
    it('closes socket if open', function () {
      return UdpServer.start().then(() => {
        UdpServer.stop();
        expect(UdpServer.socketBound).to.be.false;
      });
    });
    it('does nothing if not started', function () {
      expect(UdpServer.stop).to.not.throw();
    });
    it('does nothing if not stopped twice', function () {
      return UdpServer.start().then(() => {
        expect(UdpServer.stop).to.not.throw();
        expect(UdpServer.stop).to.not.throw();
      });
    });
  });
});
