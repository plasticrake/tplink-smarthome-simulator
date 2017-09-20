'use strict';

const EventEmitter = require('events');
const dgram = require('dgram');

const log = require('./logger')({loggerName: 'udp-server'});

const UdpServer = new EventEmitter();

UdpServer.log = log;

UdpServer.start = function ({port = 9999} = {}) {
  return new Promise((resolve, reject) => {
    this.socket = dgram.createSocket({type: 'udp4', reuseAddr: true});

    this.socket.on('listening', () => {
      const address = this.socket.address();
      this.socketBound = true;
      log.info('UDP server listening', address);
      resolve(UdpServer);
    });

    this.socket.on('message', (msg, rinfo) => {
      this.emit('message', msg, rinfo);
    });

    this.socket.on('error', (err) => {
      log.error(err);
      this.socket.close();
      this.socketBound = false;
      resolve(err);
    });

    this.socket.bind(port);
  });
};

UdpServer.stop = function () {
  if (this.socketBound) { this.socket.close(); }
};

module.exports = UdpServer;
