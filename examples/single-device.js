'use strict';

const Device = require('..').Device;
const UdpServer = require('..').UdpServer;

UdpServer.start();

let devices = [];
// Will generate random mac (used by Kasa app to uniqutely identify a device) and deviceId, etc
devices.push(new Device({ model: 'hs100', port: 9999 }));

// This uses a hardcoded mac and deviceId.
// devices.push(new Device({ model: 'hs100', data: { mac: '50:C7:BF:70:3D:F8', deviceId: '12345' } }));
