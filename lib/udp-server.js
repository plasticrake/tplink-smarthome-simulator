'use strict';

const EventEmitter = require('events');
const dgram = require('dgram');

const log = require('./logger')({loggerName: 'udp-server'});

const UdpServer = new EventEmitter();

UdpServer.log = log;

UdpServer.start = function ({port = 9999} = {}) {
  let self = UdpServer;
  self.socketBound = false;

  return new Promise((resolve, reject) => {
    self.socket = dgram.createSocket({type: 'udp4', reuseAddr: true});

    self.socket.on('listening', () => {
      const address = self.socket.address();
      self.socketBound = true;
      log.info('UDP server listening', address);
      resolve(UdpServer);
    });

    self.socket.on('message', (msg, rinfo) => {
      self.emit('message', msg, rinfo);
    });

    self.socket.on('error', (err) => {
      log.error(err);
      self.socket.close();
      self.socketBound = false;
      resolve(err);
    });

    self.socket.bind(port);
  });
};

UdpServer.stop = function () {
  let self = UdpServer;
  if (self.socketBound) {
    self.socket.close();
    self.socketBound = false;
  }
};

module.exports = UdpServer;
