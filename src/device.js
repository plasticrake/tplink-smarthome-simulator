'use strict';

const { encrypt, encryptWithHeader } = require('tplink-smarthome-crypto');

const { randomInt } = require('./utils');
const DeviceNetworking = require('./device-networking');

class Device {
  constructor ({ model, port = 0, address = '0.0.0.0', alias, responseDelay = 0, unreliablePercent = 0, data = {} } = {}) {
    this.deviceNetworking = new DeviceNetworking({device: this, model, port, address, responseDelay});

    this.model = model;
    this.data = Object.assign({}, data);
    this.data.model = model;
    if (!alias == null) this.data.alias = alias;

    let SpecificDevice = require(`./devices/${model}`);
    let deviceInfo = new SpecificDevice(this.data);
    deviceInfo.initDefaults();
    this.api = deviceInfo.api;
    this.data = deviceInfo.data;

    this.unreliablePercent = unreliablePercent;
  }

  get address () {
    return this.deviceNetworking.address;
  }

  get port () {
    return this.deviceNetworking.port;
  }

  async start () {
    return this.deviceNetworking.start();
  }

  async stop () {
    return this.deviceNetworking.stop();
  }

  processMessage (msgObj, encryptFn) {
    let responseObj = processCommand(msgObj, this.api);
    let responseJson;
    let response;

    let badData = unreliableData(this.unreliablePercent);
    if (badData !== undefined) {
      responseJson = badData;
      response = badData;
    } else if (responseObj) {
      responseJson = JSON.stringify(responseObj);
      response = encryptFn(responseJson);
    }

    return { response, responseForLog: responseJson };
  }

  processUdpMessage (msgObj) {
    return this.processMessage(msgObj, encrypt);
  }

  processTcpMessage (msgObj) {
    return this.processMessage(msgObj, encryptWithHeader);
  }
}

Device.models = ['hs100', 'hs105', 'hs110', 'hs200', 'lb100', 'lb120', 'lb130'];

const unreliableData = function (unreliablePercent) {
  if (unreliablePercent > 0 && Math.random() < unreliablePercent) {
    let bufLength = randomInt(0, 255);
    let buf = Buffer.alloc(bufLength);
    for (var i = 0; i < buf.length; i++) {
      buf[i] = randomInt(0, 255);
    }
    return buf;
  }
};

const processCommand = function (command, api, depth = 0) {
  let results = {};
  let keys = Object.keys(command);
  for (var i = 0; i < keys.length; i++) {
    let key = keys[i];
    if (typeof api[key] === 'function') {
      results[key] = api[key](command[key]);
    } else if (api[key]) {
      results[key] = processCommand(command[key], api[key], depth + 1);
    } else {
      if (depth === 0) {
        results[key] = {err_code: -1, err_msg: 'module not support'};
      } else {
        results[key] = {err_code: -2, err_msg: 'member not support'};
      }
    }
  }
  return results;
};

module.exports = { Device, processCommand };
