'use strict';

const dgram = require('dgram');
const net = require('net');
const debug = require('debug');
const utils = require('hs100-api').utils;

const UdpServer = require('./udp-server');

let log = debug('device');
let logUdp = debug('device:udp');
let logUdpErr = debug('device:udp:error');
let logTcp = debug('device:tcp');
let logTcpErr = debug('device:tcp:error');

function Device ({ model, port = 0, address = '0.0.0.0', data } = {}) {
  this.model = model;
  this.port = port;
  this.address = address;
  this.data = data;

  let SpecificDevice = require(`./devices/${model}`);
  let deviceInfo = new SpecificDevice(data);
  this.api = deviceInfo.api;
}

Device.models = ['hs100', 'hs105', 'hs110', 'hs200', 'lb100', 'lb120', 'lb130'];

Device.prototype.start = function () {
  return new Promise((resolve, reject) => {
    const server = net.createServer((socket) => {
      socket.on('data', (chunk) => {
        logTcp('[%s] TCP DATA', this.model, socket.remoteAddress, socket.remotePort);
        let decryptedMsg = utils.decryptWithHeader(chunk).toString('ascii');
        logTcp(decryptedMsg);
        this.processTcpMessage(decryptedMsg, socket);
      });
      socket.on('end', () => { socket.end(); });
    });
    server.on('error', (err) => {
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
    });

    this.udpSocket.bind(this.port, this.address, () => {
      const udpAddress = this.udpSocket.address();
      log('[%s] UDP bound', this.model, udpAddress);
      server.listen({port: udpAddress.port, host: this.address}, () => {
        const tcpAddress = server.address();
        this.host = tcpAddress.address;
        this.port = tcpAddress.port;
        log('[%s] TCP server bound', this.model, tcpAddress);
        resolve(this);
      });
    });
  });
};

Device.prototype.processUdpMessage = function (msg, rinfo) {
  let decyptedMsg = utils.decrypt(msg).toString('ascii');
  logUdp('[%s] UDP receiving', this.model, rinfo.port, rinfo.address);
  let msgObj;
  try {
    msgObj = JSON.parse(decyptedMsg);
  } catch (err) {
    logUdpErr('JSON.parse, could not parse:', msgObj);
    throw err;
  }
  logUdp(msgObj);
  let responseObj = processCommand(msgObj, this.api);

  if (responseObj) {
    var responseJson = JSON.stringify(responseObj);
    var response = utils.encrypt(responseJson);
    logUdp('[%s] UDP responding', this.model, rinfo.port, rinfo.address);
    logUdp(responseObj);
    this.udpSocket.send(response, rinfo.port, rinfo.address);
  }
};

Device.prototype.processTcpMessage = function (msg, socket) {
  let j = JSON.parse(msg);

  let responseObj = processCommand(j, this.api);

  if (responseObj) {
    var responseJson = JSON.stringify(responseObj);
    var response = utils.encryptWithHeader(responseJson);
    logTcp('[%s] TCP responding', this.model, socket.address());
    logTcp(responseObj);
    socket.write(response);
  }
};

const processCommand = function (command, api) {
  let results = {};
  let keys = Object.keys(command);
  for (var i = 0; i < keys.length; i++) {
    let key = keys[i];
    if (typeof api[key] === 'function') {
      results[key] = api[key](command[key]);
    } else if (api[key]) {
      results[key] = processCommand(command[key], api[key]);
    }
  }
  return results;
};

module.exports = { Device, processCommand };
