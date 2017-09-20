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
      expect(device).to.have.property('data', opt.data);
      expect(device.api).to.exist;
    });
    it('defaults', function () {
      let device = new Device({model: 'hs100'});
      expect(device).to.have.property('port', 0);
      expect(device).to.have.property('address', '0.0.0.0');
      expect(device).to.have.property('data', undefined);
      expect(device.api).to.exist;
    });
    it('throw if no model', function () {
      expect(() => { new Device(); }).to.throw(); // eslint-disable-line no-new
    });
    it('throw if invalid model', function () {
      expect(() => { new Device({model: 'invalid_model'}); }).to.throw();// eslint-disable-line no-new
    });

    Device.models.forEach((model) => {
      describe(model, function () {
        it('has api', function () {
          let device = new Device({model});
          expect(device.api).to.exist;
        });
      });
    });
  });
});
