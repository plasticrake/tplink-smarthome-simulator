/* eslint-disable no-underscore-dangle */
const { encrypt, encryptWithHeader } = require('tplink-smarthome-crypto');

const { processCommands, unreliableData } = require('./utils');
const DeviceNetworking = require('./device-networking');

class Device {
  constructor({
    model,
    port = 0,
    address = '0.0.0.0',
    alias,
    responseDelay = 0,
    unreliablePercent = 0,
    data = {},
  } = {}) {
    this.deviceNetworking = new DeviceNetworking({
      device: this,
      model,
      port,
      address,
      responseDelay,
    });

    this.model = model;
    this.data = { ...data };
    this.data.model = model;
    if (alias != null) this.data.alias = alias;

    // eslint-disable-next-line global-require, import/no-dynamic-require
    const SpecificDevice = require(`./devices/${model}`);
    this._deviceInfo = new SpecificDevice(this.data);
    this._deviceInfo.initDefaults();
    this.api = this._deviceInfo.api;
    this.data = this._deviceInfo.data;

    this.unreliablePercent = unreliablePercent;
  }

  get address() {
    return this.deviceNetworking.address;
  }

  get port() {
    return this.deviceNetworking.port;
  }

  async start() {
    return this.deviceNetworking.start();
  }

  async stop() {
    return this.deviceNetworking.stop();
  }

  get children() {
    return this._deviceInfo.children;
  }

  processMessage(msg, encryptFn, customizerFn) {
    this._deviceInfo.reset();
    let responseUnencrypted = processCommands(
      msg,
      this.api,
      this._deviceInfo.constructor.errors,
      customizerFn
    );
    let response = encryptFn(responseUnencrypted);

    const badData = unreliableData(this.unreliablePercent);
    if (badData !== undefined) {
      responseUnencrypted = badData;
      response = badData;
    }

    return { response, responseForLog: responseUnencrypted };
  }

  processUdpMessage(msg) {
    return this.processMessage(
      msg,
      encrypt,
      (moduleName, methodName, methodResponse) => {
        // UDP only returns last two characters of child.id
        if (
          moduleName === 'system' &&
          methodName === 'get_sysinfo' &&
          methodResponse &&
          methodResponse.children &&
          methodResponse.children.length > 0
        ) {
          methodResponse.children.forEach((child) => {
            // eslint-disable-next-line no-param-reassign
            child.id = child.id.slice(-2);
          });
        }
        return methodResponse;
      }
    );
  }

  processTcpMessage(msg) {
    return this.processMessage(msg, encryptWithHeader);
  }
}

Device.models = [
  'hs100',
  'hs105',
  'hs110',
  'hs110v2',
  'hs200',
  'hs220',
  'hs300',
  'lb100',
  'lb120',
  'lb130',
];

module.exports = { Device, processCommands };
