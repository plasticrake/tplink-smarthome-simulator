/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */

'use strict';

const chai = require('chai');
const expect = chai.expect;

const Device = require('..').Device;

describe('Device', function () {
  describe('constructor()', function () {
    it('accept options', function () {
      var opt = {model: 'hs100', port: 1234, address: '127.0.0.1', data: {'deviceId': 'ABC'}};
      let device = new Device(opt);
      expect(device).to.have.property('model', opt.model);
      expect(device).to.have.property('port', opt.port);
      expect(device).to.have.property('address', opt.address);
      expect(device).to.have.nested.property('data.deviceId', opt.data.deviceId);
      expect(device.api).to.exist;
    });
    it('defaults', function () {
      let device = new Device({model: 'hs100'});
      expect(device).to.have.property('port', 0);
      expect(device).to.have.property('address', '0.0.0.0');
      expect(device).to.have.deep.property('data', {model: 'hs100'});
      expect(device.api).to.exist;
    });
    it('throw if no model', function () {
      expect(() => { new Device(); }).to.throw(); // eslint-disable-line no-new
    });
    it('throw if invalid model', function () {
      expect(() => { new Device({model: 'invalid_model'}); }).to.throw();// eslint-disable-line no-new
    });

    Device.models.forEach((model) => {
      let device;
      beforeEach(function () {
        device = new Device({model});
      });
      describe(model, function () {
        it('has api', function () {
          expect(device.api).to.exist;
        });
      });
    });
  });

  let device;
  beforeEach(function () {
    device = new Device({model: 'hs100'});
  });

  describe('#start()', function () {
    before(function () {
      this.timeout = 5000;
    });

    it('should open server / sockets', async function () {
      await device.start();
      expect(device.udpSocketBound).to.be.true;
      expect(device.serverBound).to.be.true;
      return device.stop();
    });
  });

  describe('#stop()', function () {
    before(function () {
      this.timeout = 5000;
    });
    it('should close server / sockets', async function () {
      await device.start();
      await device.stop();
      expect(device.udpSocketBound).to.be.false;
      expect(device.serverBound).to.be.false;
    });
    it('does nothing when stopped twice', async function () {
      await device.start();
      await device.stop();
      return device.stop();
    });
    it('does nothing if not started', async function () {
      return device.stop();
    });
  });
});
