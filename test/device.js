/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */

'use strict';

const chai = require('chai');
const expect = chai.expect;

const Device = require('../src').Device;
const processCommands = require('../src/device').processCommands;

describe('Device', function () {
  this.retries(2);

  describe('constructor()', function () {
    it('accept options', function () {
      var opt = { model: 'hs100', port: 1234, address: '127.0.0.1', data: { 'deviceId': 'ABC' } };
      const device = new Device(opt);
      expect(device).to.have.property('model', opt.model);
      expect(device).to.have.property('port', opt.port);
      expect(device).to.have.property('address', opt.address);
      expect(device).to.have.nested.property('data.deviceId', opt.data.deviceId);
      expect(device.api).to.exist;
    });
    it('defaults', function () {
      const device = new Device({ model: 'hs100' });
      expect(device).to.have.property('port', 0);
      expect(device).to.have.property('address', '0.0.0.0');
      expect(device).to.have.nested.property('data.model', 'hs100');
      expect(device.api).to.exist;
    });
    it('throw if no model', function () {
      expect(() => { new Device(); }).to.throw(); // eslint-disable-line no-new
    });
    it('throw if invalid model', function () {
      expect(() => { new Device({ model: 'invalid_model' }); }).to.throw();// eslint-disable-line no-new
    });

    Device.models.forEach((model) => {
      let device;
      beforeEach(function () {
        device = new Device({ model });
      });
      describe(model, function () {
        it('has api', function () {
          expect(device.api).to.exist;
        });
      });
    });
  });

  describe('private', function () {
    this.retries(0);
    let api;
    before(function () {
      api = {
        system: {
          get_sysinfo: () => {
            return { alias: 'test' };
          }
        }
      };
    });

    describe('processCommands', function () {
      it('should get command results', function () {
        const results = processCommands(
          JSON.stringify({ system: { get_sysinfo: {} } }),
          api
        );
        expect(results).to.eql(
          JSON.stringify({ system: { get_sysinfo: api.system.get_sysinfo() } })
        );
      });

      it('should get command results (duplicate modules)', function () {
        const results = processCommands(
          `{"system":{"get_sysinfo":{}},"system":{"get_sysinfo":{}}}`,
          api
        );
        expect(results).to.eql(
          `{"system":{"get_sysinfo":${JSON.stringify(
            api.system.get_sysinfo()
          )}},"system":{"get_sysinfo":${JSON.stringify(
            api.system.get_sysinfo()
          )}}}`
        );
      });

      it('should get command results (duplicate methods)', function () {
        const results = processCommands(
          `{"system":{"get_sysinfo":{},"get_sysinfo":{}}}`,
          api
        );
        expect(results).to.eql(
          `{"system":{"get_sysinfo":${JSON.stringify(
            api.system.get_sysinfo()
          )},"get_sysinfo":${JSON.stringify(api.system.get_sysinfo())}}}`
        );
      });

      it('should result in err_code -1 with invalid module', function () {
        const results = processCommands(
          JSON.stringify({ system_invalid: { get_sysinfo: {} } }),
          api
        );
        expect(results).to.eql(
          JSON.stringify({
            system_invalid: { err_code: -1, err_msg: 'module not support' }
          })
        );
      });

      it('should result in err_code -1 with invalid module (with other valid command)', function () {
        const results = processCommands(
          JSON.stringify({ system_invalid: { get_sysinfo: {} }, system: { get_sysinfo: {} } }),
          api
        );
        expect(results).to.eql(
          JSON.stringify({
            system_invalid: { err_code: -1, err_msg: 'module not support' },
            system: { 'get_sysinfo': api.system.get_sysinfo() }
          })
        );
      });

      it('should result in err_code -1 with invalid module with two methods (with other valid command)', function () {
        const results = processCommands(
          JSON.stringify({ system_invalid: { get_sysinfo: {}, another_method: {} }, system: { get_sysinfo: {} } }),
          api
        );
        expect(results).to.eql(
          JSON.stringify({
            system_invalid: { err_code: -1, err_msg: 'module not support' },
            system: { 'get_sysinfo': api.system.get_sysinfo() }
          })
        );
      });

      it('should result in err_code -2 with invalid member', function () {
        const results = processCommands(
          JSON.stringify({ system: { get_sysinfo_invalid: {} } }),
          api
        );
        expect(results).to.eql(
          JSON.stringify({
            system: {
              get_sysinfo_invalid: {
                err_code: -2,
                err_msg: 'member not support'
              }
            }
          })
        );
      });
    });
  });

  Device.models.forEach((model) => {
    let device;
    beforeEach(function () {
      device = new Device({ model });
    });
    describe(model, function () {
      describe('#start()', function () {
        before(function () {
          this.timeout = 5000;
        });

        it('should open server / sockets', async function () {
          await device.start();
          expect(device.deviceNetworking.udpSocketBound).to.be.true;
          expect(device.deviceNetworking.serverBound).to.be.true;
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
          expect(device.deviceNetworking.udpSocketBound).to.be.false;
          expect(device.deviceNetworking.serverBound).to.be.false;
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
  });
});
