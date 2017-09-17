'use strict';

const Device = require('..').Device;
const UdpServer = require('..').UdpServer;

UdpServer.start();

let devices = [];
// Unfortunately all devices must use port 9999 for the Kasa app to work with them
// So if we have mulitple devices on other ports they will be inaccessible to Kasa
devices.push(new Device({ model: 'hs100', port: 9999, data: { mac: 'f4:0f:24:30:e9:13', deviceId: '1' } }));
// Random port, specified mac / deviceId
devices.push(new Device({ model: 'hs105', data: { mac: '50:C7:BF:70:3D:F8', deviceId: '2' } }));
// Random port / mac / deviceId
devices.push(new Device({ model: 'hs110', data: { deviceId: '3' } }));
devices.push(new Device({ model: 'lb100', data: { deviceId: '4' } }));
