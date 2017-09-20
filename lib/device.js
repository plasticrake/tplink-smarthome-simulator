'use strict';

const dgram = require('dgram');
const net = require('net');

const utils = require('hs100-api').utils;

const UdpServer = require('./udp-server');

function Device ({model, port = 0, address, data}) {
  this.model = model;
  this.port = port;
  this.address = address;
  this.data = data;
  let SpecificDevice = require(`./devices/${model}`);
  let deviceInfo = new SpecificDevice(data);
  this.api = deviceInfo.api;

  console.log(`${model} ${address}:${port}`);
  console.dir(deviceInfo.data.system);
}

Device.prototype.start = function () {
  const server = net.createServer((socket) => {
    socket.on('data', (chunk) => {
      console.log('[%s] TCP DATA', this.model, socket.remoteAddress, socket.remotePort);
      let decryptedMsg = utils.decryptWithHeader(chunk).toString('ascii');
      console.log(decryptedMsg);
      this.processTcpMessage(decryptedMsg, socket);
    });
    socket.on('end', () => { socket.end(); });
  });
  server.on('error', (err) => {
    throw err;
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
    console.log('[%s] UDP bound', this.model, udpAddress);
    server.listen({port: udpAddress.port, host: this.address}, () => {
      console.log('[%s] TCP server bound', this.model, server.address());
    });
  });
};

Device.prototype.processUdpMessage = function (msg, rinfo) {
  let decyptedMsg = utils.decrypt(msg).toString('ascii');
  console.log('[%s] UDP DATA', this.model, rinfo.port, rinfo.address);
  console.log(decyptedMsg);
  let j = JSON.parse(decyptedMsg);
  let responseObj = processCommand(j, this.api);

  if (responseObj) {
    var responseJson = JSON.stringify(responseObj);
    var response = utils.encrypt(responseJson);
    console.log('[%s] UDP responding', this.model, rinfo.port, rinfo.address);
    console.dir(responseObj, {depth: 2, colors: true});
    this.udpSocket.send(response, rinfo.port, rinfo.address);
  }
};

Device.prototype.processTcpMessage = function (msg, socket) {
  let j = JSON.parse(msg);

  let responseObj = processCommand(j, this.api);

  if (responseObj) {
    var responseJson = JSON.stringify(responseObj);
    var response = utils.encryptWithHeader(responseJson);
    console.log('TCP responding', socket.address());
    console.dir(responseObj, {depth: 2, colors: true});
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
