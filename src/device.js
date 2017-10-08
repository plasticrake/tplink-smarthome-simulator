'use strict';

const EventEmitter = require('events');
const dgram = require('dgram');
const net = require('net');
const debug = require('debug');
const TplinkCrypto = require('hs100-api').TplinkCrypto;

const UdpServer = require('./udp-server');

let log = debug('device');
let logUdp = debug('device:udp');
let logUdpErr = debug('device:udp:error');
let logTcp = debug('device:tcp');
let logTcpErr = debug('device:tcp:error');

class Device extends EventEmitter {
  constructor ({ model, port = 0, address = '0.0.0.0', alias, data = {} } = {}) {
    super();
    this.model = model;
    this.port = port;
    this.address = address;
    this.data = Object.assign({}, data);
    this.data.model = model;
    if (!alias == null) this.data.alias = alias;

    this.serverBound = false;
    this.udpSocketBound = false;

    let SpecificDevice = require(`./devices/${model}`);
    let deviceInfo = new SpecificDevice(data);
    this.api = deviceInfo.api;
  }

  async start () {
    return new Promise((resolve, reject) => {
      this.server = net.createServer((socket) => {
        socket.on('data', (chunk) => {
          this.processTcpMessage(chunk, socket);
        });
        socket.on('error', (err) => { this.emit('error', err); });
        socket.on('end', () => { socket.end(); });
      });
      this.server.on('error', (err) => {
        logTcpErr(err);
        reject(err);
      });

      // bind to UDP then TCP and share port
      this.udpSocket = dgram.createSocket({type: 'udp4', reuseAddr: true});

      UdpServer.on('message', (msg, rinfo) => {
        this.processUdpMessage(msg, rinfo);
      });

      this.udpSocket.on('message', (msg, rinfo) => {
        this.processUdpMessage(msg, rinfo);
      });

      this.udpSocket.on('error', (exception) => {
        logUdpErr(exception);
        this.udpSocket.close();
        this.udpSocketBound = false;
      });

      this.udpSocket.bind(this.port, this.address, () => {
        this.udpSocketBound = true;
        const udpAddress = this.udpSocket.address();
        log('[%s] UDP bound', this.model, udpAddress);
        this.server.listen({port: udpAddress.port, host: this.address}, () => {
          this.serverBound = true;
          const tcpAddress = this.server.address();
          this.address = tcpAddress.address;
          this.port = tcpAddress.port;
          log('[%s] TCP server bound', this.model, tcpAddress);
          resolve(this);
        });
      });
    });
  }

  async stop () {
    return new Promise((resolve, reject) => {
      if (this.udpSocketBound) {
        this.udpSocket.close();
        this.udpSocketBound = false;
      }
      if (this.serverBound) {
        this.server.close(() => {
          this.serverBound = false;
          resolve(this);
        });
      } else {
        resolve(this);
      }
    });
  }

  processUdpMessage (msg, rinfo) {
    let decryptedMsg = TplinkCrypto.decrypt(msg).toString('ascii');
    logUdp('[%s] UDP receiving', this.model, rinfo.port, rinfo.address);
    this.emit('data', { time: Date.now(), protocol: 'udp', message: decryptedMsg, remoteAddress: rinfo.address, remortPort: rinfo.port });
    let msgObj;
    try {
      msgObj = JSON.parse(decryptedMsg);
    } catch (err) {
      logUdpErr('JSON.parse, could not parse:', decryptedMsg);
      this.emit('error', err);
      throw err;
    }
    logUdp(msgObj);
    let responseObj = processCommand(msgObj, this.api);

    if (responseObj) {
      let responseJson = JSON.stringify(responseObj);
      let encryptedResponse = TplinkCrypto.encrypt(responseJson);
      logUdp('[%s] UDP responding', this.model, rinfo.port, rinfo.address);
      logUdp(responseObj);
      this.emit('response', { time: Date.now(), protocol: 'tcp', message: responseJson, remoteAddress: rinfo.address, remortPort: rinfo.port });
      this.udpSocket.send(encryptedResponse, 0, encryptedResponse.length, rinfo.port, rinfo.address);
    }
  }

  processTcpMessage (msg, socket) {
    logTcp('[%s] TCP DATA', this.model, socket.remoteAddress, socket.remotePort);
    let decryptedMsg = TplinkCrypto.decryptWithHeader(msg).toString('ascii');
    logTcp(decryptedMsg);
    this.emit('data', { time: Date.now(), protocol: 'tcp', message: decryptedMsg, localAddress: socket.localAddress, localPort: socket.localPort, remoteAddress: socket.remoteAddress, remortPort: socket.remotePort });
    let msgObj;
    try {
      msgObj = JSON.parse(decryptedMsg);
    } catch (err) {
      logUdpErr('JSON.parse, could not parse:', decryptedMsg);
      this.emit('error', err);
      throw err;
    }

    let responseObj = processCommand(msgObj, this.api);

    if (responseObj) {
      let responseJson = JSON.stringify(responseObj);
      let encryptedResponse = TplinkCrypto.encryptWithHeader(responseJson);
      logTcp('[%s] TCP responding', this.model, socket.address());
      logTcp(responseObj);
      this.emit('response', { time: Date.now(), protocol: 'tcp', message: responseJson, localAddress: socket.localAddress, localPort: socket.localPort, remoteAddress: socket.remoteAddress, remortPort: socket.remotePort });
      socket.write(encryptedResponse);
    }
  }
}

Device.models = ['hs100', 'hs105', 'hs110', 'hs200', 'lb100', 'lb120', 'lb130'];

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
