/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */

'use strict';

const chai = require('chai');
const expect = chai.expect;

const UdpServer = require('../src').UdpServer;

describe('UdpServer', function () {
  this.retries(2);
  describe('.start()', function () {
    it('defaults', async function () {
      await UdpServer.start();
      expect(UdpServer.socket.address().port).to.eql(9999);
      UdpServer.stop();
    });
    it('opens socket', async function () {
      await UdpServer.start();
      expect(UdpServer.socketBound).to.be.true;
      UdpServer.stop();
    });
  });
  describe('.stop()', function () {
    it('closes socket if open', async function () {
      await UdpServer.start();
      UdpServer.stop();
      expect(UdpServer.socketBound).to.be.false;
    });
    it('does nothing if not started', function () {
      expect(UdpServer.stop).to.not.throw();
    });
    it('does nothing when stopped twice', async function () {
      await UdpServer.start();
      expect(UdpServer.stop).to.not.throw();
      expect(UdpServer.stop).to.not.throw();
    });
  });
});
