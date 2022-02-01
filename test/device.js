/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const { expect } = chai;

const { Device } = require('../src');
const { processCommands } = require('../src/device');
const Hs = require('../src/devices/hs');

chai.use(sinonChai);

describe('Device', function () {
  this.retries(2);

  describe('constructor()', function () {
    describe('arguments', function () {
      const opts = [
        {
          model: 'hs100',
          port: 1234,
          address: '127.0.0.1',
          alias: 'MY ALIAS',
          data: { deviceId: 'ABC', mac: 'aa:aa:aa:bb:bb:bb' },
        },
      ];

      Device.models.forEach(function (model) {
        describe(model, function () {
          opts.forEach(function (opt) {
            let device;
            before(function () {
              device = new Device({ ...opt, model });
            });
            it('accept options', function () {
              expect(device).to.have.property('model', model);
              expect(device).to.have.property('port', opt.port);
              expect(device).to.have.property('address', opt.address);
              expect(device).to.have.nested.property('data.alias', opt.alias);
              expect(device).to.have.nested.property(
                'data.deviceId',
                opt.data.deviceId
              );
              expect(device).to.have.nested.property('data.mac', opt.data.mac);
              expect(device.api).to.exist;
            });

            it('sets mac', function () {
              if (opt.data.mac === undefined) this.skip();
              expect(device.mac).to.eql(opt.data.mac);
            });
          });
        });
      });
    });

    it('defaults', function () {
      const device = new Device({ model: 'hs100' });
      expect(device).to.have.property('port', 0);
      expect(device).to.have.property('address', '0.0.0.0');
      expect(device).to.have.nested.property('data.model', 'hs100');
      expect(device.api).to.exist;
    });
    it('throw if no model', function () {
      expect(() => {
        new Device(); // eslint-disable-line no-new
      }).to.throw();
    });
    it('throw if invalid model', function () {
      expect(() => {
        new Device({ model: 'invalid_model' }); // eslint-disable-line no-new
      }).to.throw();
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
    let apiWithContext;
    const contextSpy = sinon.spy();

    this.beforeEach(function () {
      api = {
        system: {
          get_sysinfo: () => {
            return { alias: 'test' };
          },
        },
      };
      apiWithContext = {
        system: {
          get_sysinfo: () => {
            return { alias: 'test' };
          },
        },
        context: { child_ids: contextSpy },
      };
    });

    this.afterEach(function () {
      sinon.reset();
    });

    describe('processCommands', function () {
      describe('context', function () {
        it('should get command results and ignore context when method does not support', function () {
          const results = processCommands(
            JSON.stringify({
              system: { get_sysinfo: {} },
              context: { child_ids: ['01'] },
            }),
            api
          );
          expect(results).to.eql(
            JSON.stringify({
              system: { get_sysinfo: api.system.get_sysinfo() },
            })
          );
        });

        it('should get command results and ignore context when method does not support, error for additional context', function () {
          const results = processCommands(
            '{"system":{"get_sysinfo":{}},"context":{"child_ids":["01"]},"context":{"child_ids":["02"]}}',
            api,
            Hs.errors
          );
          expect(results).to.eql(
            JSON.stringify({
              system: { get_sysinfo: api.system.get_sysinfo() },
              context: { err_code: -1, err_msg: 'module not support' },
            })
          );
        });

        it('should get command results and ignore context when method does not support, error for multiple additional context', function () {
          const results = processCommands(
            '{"system":{"get_sysinfo":{}},"context":{"child_ids":["01"]},"context":{"child_ids":["02"]},"context":{"child_ids":["03"]}}',
            api,
            Hs.errors
          );
          expect(results).to.eql(
            '{"system":{"get_sysinfo":{"alias":"test"}},"context":{"err_code":-1,"err_msg":"module not support"},"context":{"err_code":-1,"err_msg":"module not support"}}'
          );
        });

        it('should get command results, error for multiple additional context', function () {
          const results = processCommands(
            '{"system":{"get_sysinfo":{}},"context":{"child_ids":["01"]},"context":{"child_ids":["02"]},"context":{"child_ids":["03"]}}',
            apiWithContext,
            Hs.errors
          );
          expect(results).to.eql(
            '{"system":{"get_sysinfo":{"alias":"test"}},"context":{"err_code":-1,"err_msg":"module not support"},"context":{"err_code":-1,"err_msg":"module not support"}}'
          );
          expect(contextSpy).to.be.calledOnceWithExactly(['01']);
        });
      });

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
          api,
          Hs.errors
        );
        expect(results).to.eql(
          JSON.stringify({
            system_invalid: { err_code: -1, err_msg: 'module not support' },
          })
        );
      });

      it('should result in err_code -1 with invalid module (with other valid command)', function () {
        const results = processCommands(
          JSON.stringify({
            system_invalid: { get_sysinfo: {} },
            system: { get_sysinfo: {} },
          }),
          api,
          Hs.errors
        );
        expect(results).to.eql(
          JSON.stringify({
            system_invalid: { err_code: -1, err_msg: 'module not support' },
            system: { get_sysinfo: api.system.get_sysinfo() },
          })
        );
      });

      it('should result in err_code -1 with invalid module with two methods (with other valid command)', function () {
        const results = processCommands(
          JSON.stringify({
            system_invalid: { get_sysinfo: {}, another_method: {} },
            system: { get_sysinfo: {} },
          }),
          api,
          Hs.errors
        );
        expect(results).to.eql(
          JSON.stringify({
            system_invalid: { err_code: -1, err_msg: 'module not support' },
            system: { get_sysinfo: api.system.get_sysinfo() },
          })
        );
      });

      it('should result in err_code -2 with invalid member', function () {
        const results = processCommands(
          JSON.stringify({ system: { get_sysinfo_invalid: {} } }),
          api,
          Hs.errors
        );
        expect(results).to.eql(
          JSON.stringify({
            system: {
              get_sysinfo_invalid: {
                err_code: -2,
                err_msg: 'member not support',
              },
            },
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
