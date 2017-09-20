'use strict';

const Device = require('..').Device;
const UdpServer = require('..').UdpServer;

let devices = [];

UdpServer.log.setLevel('debug');
Device.log.setLevel('debug');

Device.inspectOptions = { colors: false, depth: 1 };

devices.push(new Device({ model: 'hs100' }));
devices.push(new Device({ model: 'lb100' }));

devices.forEach((d) => {
  d.start();
});

UdpServer.start();
