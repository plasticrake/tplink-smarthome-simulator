'use strict';

const EventEmitter = require('events');
const dgram = require('dgram');
const net = require('net');
const debug = require('debug');
const { decrypt, decryptWithHeader } = require('tplink-smarthome-crypto');

const UdpServer = require('./udp-server');

let log = debug('device');
let logUdp = debug('device:udp');
let logUdpErr = debug('device:udp:error');
let logTcp = debug('device:tcp');
let logTcpErr = debug('device:tcp:error');

class DeviceNetworking extends EventEmitter {
  constructor ({ device, model, port = 0, address = '0.0.0.0', responseDelay = 0 } = {}) {
    super();
    this.device = device;
    this.model = model;
    this.port = port;
    this.address = address;
    this.responseDelay = responseDelay;

    this.serverBound = false;
    this.udpSocketBound = false;
  }

  processUdpMessage (msg, rinfo) {
    let decryptedMsg = decrypt(msg).toString('utf8');
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

    let {response, responseForLog} = this.device.processUdpMessage(msgObj);

    if (response !== undefined) {
      setTimeout(() => {
        logUdp('[%s] UDP responding, delay:%s,', this.model, this.responseDelay, rinfo.port, rinfo.address);
        logUdp(responseForLog);
        this.emit('response', { time: Date.now(), protocol: 'tcp', message: responseForLog, remoteAddress: rinfo.address, remortPort: rinfo.port });
        this.udpSocket.send(response, 0, response.length, rinfo.port, rinfo.address);
      }, this.responseDelay);
    }
  }

  processTcpMessage (msg, socket) {
    logTcp('[%s] TCP DATA', this.model, socket.remoteAddress, socket.remotePort);
    let decryptedMsg = decryptWithHeader(msg).toString('utf8');
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

    let {response, responseForLog} = this.device.processTcpMessage(msgObj);

    if (response !== undefined) {
      setTimeout(() => {
        logTcp('[%s] TCP responding, delay:%s,', this.model, this.responseDelay, socket.address());
        logTcp(responseForLog);
        this.emit('response', { time: Date.now(), protocol: 'tcp', message: responseForLog, localAddress: socket.localAddress, localPort: socket.localPort, remoteAddress: socket.remoteAddress, remortPort: socket.remotePort });
        socket.write(response);
      }, this.responseDelay);
    }
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

      // Save to call removeListener on #stop()
      this.udpCb = (msg, rinfo) => {
        this.processUdpMessage(msg, rinfo);
      };

      UdpServer.on('message', this.udpCb);

      this.udpSocket.on('message', this.udpCb);

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
      if (typeof this.udpCb === 'function') {
        UdpServer.removeListener('message', this.udpCb);
      }
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
}

module.exports = DeviceNetworking;
