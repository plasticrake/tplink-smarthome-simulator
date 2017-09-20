'use strict';

const EventEmitter = require('events');
const dgram = require('dgram');

const UdpServer = new EventEmitter();

UdpServer.start = function ({port = 9999} = {}) {
  return new Promise((resolve, reject) => {
    this.socket = dgram.createSocket({type: 'udp4', reuseAddr: true});

    this.socket.on('listening', () => {
      const address = this.socket.address();
      console.log(`UDP server listening ${address}`);
      resolve(UdpServer);
    });

    this.socket.on('message', (msg, rinfo) => {
      this.emit('message', msg, rinfo);
    });

    this.socket.on('error', (err) => {
      console.log(`server error:\n${err.stack}`);
      this.socket.close();
      resolve(err);
    });

    this.socket.bind(port);
  });
};

UdpServer.stop = function () {
  if (this.socket) { this.socket.close(); }
};

module.exports = UdpServer;
