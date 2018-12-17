'use strict';

const { encrypt, encryptWithHeader } = require('tplink-smarthome-crypto');

const { randomInt } = require('./utils');
const DeviceNetworking = require('./device-networking');

class Device {
  constructor ({ model, port = 0, address = '0.0.0.0', alias, responseDelay = 0, unreliablePercent = 0, data = {} } = {}) {
    this.deviceNetworking = new DeviceNetworking({ device: this, model, port, address, responseDelay });

    this.model = model;
    this.data = Object.assign({}, data);
    this.data.model = model;
    if (!alias == null) this.data.alias = alias;

    let SpecificDevice = require(`./devices/${model}`);
    this._deviceInfo = new SpecificDevice(this.data);
    this._deviceInfo.initDefaults();
    this.api = this._deviceInfo.api;
    this.data = this._deviceInfo.data;

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

  get children () {
    return this._deviceInfo.children;
  }

  processMessage (msgObj, encryptFn, customizerFn) {
    let responseObj = processCommand(msgObj, this.api);
    let responseJson;
    let response;

    let badData = unreliableData(this.unreliablePercent);
    if (badData !== undefined) {
      responseJson = badData;
      response = badData;
    } else if (responseObj) {
      if (customizerFn == null) {
        customizerFn = (obj) => { return obj; };
      }
      responseJson = JSON.stringify(customizerFn(responseObj));
      response = encryptFn(responseJson);
    }

    return { response, responseForLog: responseJson };
  }

  processUdpMessage (msgObj) {
    return this.processMessage(msgObj, encrypt, (obj) => {
      // UDP only returns last two characters of child.id
      if (obj.system && obj.system.get_sysinfo && obj.system.get_sysinfo.children && obj.system.get_sysinfo.children.length > 0) {
        obj.system.get_sysinfo.children.map((child) => {
          child.id = child.id.slice(-2);
          return child;
        });
      }
      return obj;
    });
  }

  processTcpMessage (msgObj) {
    return this.processMessage(msgObj, encryptWithHeader);
  }
}

Device.models = ['hs100', 'hs105', 'hs110', 'hs110v2', 'hs200', 'hs220', 'hs300', 'lb100', 'lb120', 'lb130'];

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

  // if includes context, call it first so rest of commands will have context set
  if (depth === 0 && command.context && command.context.child_ids) {
    let contextResults = api.context.child_ids(command.context.child_ids);
    if (contextResults.err_code !== 0) {
      results['context'] = contextResults;
    }
  }

  for (var i = 0; i < keys.length; i++) {
    let key = keys[i];
    if (key === 'context') {
      continue; // already processed above
    }
    if (typeof api[key] === 'function') {
      results[key] = api[key](command[key]);
    } else if (api[key]) {
      results[key] = processCommand(command[key], api[key], depth + 1);
    } else {
      if (depth === 0) {
        results[key] = { err_code: -1, err_msg: 'module not support' };
      } else {
        results[key] = { err_code: -2, err_msg: 'member not support' };
      }
    }
  }
  return results;
};

module.exports = { Device, processCommand };
