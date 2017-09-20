'use strict';

const util = require('util');
const dgram = require('dgram');
const net = require('net');
const log = require('./logger')({loggerName: 'device'});
const utils = require('hs100-api').utils;

const UdpServer = require('./udp-server');

function Device ({ model, port = 0, address = '0.0.0.0', data } = {}) {
  this.model = model;
  this.port = port;
  this.address = address;
  this.data = data;

  let SpecificDevice = require(`./devices/${model}`);
  let deviceInfo = new SpecificDevice(data);
  this.api = deviceInfo.api;
}

Device.log = log;
Device.inspectOptions = { colors: true, depth: 2 };
Device.models = ['hs100', 'hs105', 'hs110', 'hs200', 'lb100', 'lb120', 'lb130'];

Device.prototype.start = function () {
  return new Promise((resolve, reject) => {
    const server = net.createServer((socket) => {
      socket.on('data', (chunk) => {
        log.debug('[%s] TCP DATA', this.model, socket.remoteAddress, socket.remotePort);
        let decryptedMsg = utils.decryptWithHeader(chunk).toString('ascii');
        log.debug(decryptedMsg);
        this.processTcpMessage(decryptedMsg, socket);
      });
      socket.on('end', () => { socket.end(); });
    });
    server.on('error', (err) => {
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

    this.udpSocket.bind(this.port, this.address, () => {
      const udpAddress = this.udpSocket.address();
      log.info('[%s] UDP bound', this.model, udpAddress);
      server.listen({port: udpAddress.port, host: this.address}, () => {
        const tcpAddress = server.address();
        this.host = tcpAddress.address;
        this.port = tcpAddress.port;
        log.info('[%s] TCP server bound', this.model, tcpAddress);
        resolve(this);
      });
    });
  });
};

Device.prototype.processUdpMessage = function (msg, rinfo) {
  let decyptedMsg = utils.decrypt(msg).toString('ascii');
  log.debug('[%s] UDP receiving', this.model, rinfo.port, rinfo.address);
  let msgObj;
  try {
    msgObj = JSON.parse(decyptedMsg);
  } catch (err) {
    log.error('JSON.parse, could not parse:', msgObj);
    throw err;
  }
  log.debug(inspect(msgObj));
  let responseObj = processCommand(msgObj, this.api);

  if (responseObj) {
    var responseJson = JSON.stringify(responseObj);
    var response = utils.encrypt(responseJson);
    log.debug('[%s] UDP responding', this.model, rinfo.port, rinfo.address);
    log.debug(inspect(responseObj));
    this.udpSocket.send(response, rinfo.port, rinfo.address);
  }
};

Device.prototype.processTcpMessage = function (msg, socket) {
  let j = JSON.parse(msg);

  let responseObj = processCommand(j, this.api);

  if (responseObj) {
    var responseJson = JSON.stringify(responseObj);
    var response = utils.encryptWithHeader(responseJson);
    log.debug('[%s] TCP responding', this.model, socket.address());
    log.debug(inspect(responseObj));
    socket.write(response);
  }
};

const inspect = function (obj) {
  return util.inspect(obj, Device.inspectOptions);
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
