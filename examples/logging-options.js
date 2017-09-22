'use strict';

const Device = require('..').Device;
const UdpServer = require('..').UdpServer;

let devices = [];

UdpServer.logger.getLogger('udp-server').setLevel('debug');
Device.logger.getLogger('device').setLevel('debug');
Device.logger.getLogger('tcp').setLevel('debug');
Device.logger.getLogger('udp').setLevel('warn');

Device.inspectOptions = { colors: true, depth: 2 }; // Defaults

devices.push(new Device({ model: 'hs100' }));
devices.push(new Device({ model: 'lb100' }));

devices.forEach((d) => {
  d.start();
});

UdpServer.start();
