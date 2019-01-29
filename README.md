
# tplink-smarthome-simulator
[![NPM Version](https://img.shields.io/npm/v/tplink-smarthome-simulator.svg)](https://www.npmjs.com/package/tplink-smarthome-simulator)
[![Build Status](https://travis-ci.org/plasticrake/tplink-smarthome-simulator.svg?branch=master)](https://travis-ci.org/plasticrake/tplink-smarthome-simulator)
[![codecov](https://codecov.io/gh/plasticrake/tplink-smarthome-simulator/branch/master/graph/badge.svg)](https://codecov.io/gh/plasticrake/tplink-smarthome-simulator)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

<img src="https://user-images.githubusercontent.com/1383980/30628984-4eb5bf5e-9d8e-11e7-9caa-97720ae1eadc.png" align="right" alt="Kasa Screenshot" width=250>


TP-Link Smart Home Device Simulator

I created this so I could automate my tests for [tplink-smarthome-api](https://github.com/plasticrake/tplink-smarthome-api/).

See more [examples](https://github.com/plasticrake/tplink-smarthome-simulator/tree/master/examples).

[`debug`](https://github.com/visionmedia/debug) is used for output. To see all messages set the DEBUG environment variable.
To see everything:
```
DEBUG=* node examples/multi-device.js
```

To see most:
```
DEBUG=*,-device:udp,*:error node examples/multi-device.js
```


```javascript
'use strict';

const Device = require('..').Device;
const UdpServer = require('..').UdpServer;

let devices = [];

// If you setup virtual interfaces or aliases you can have unique ips to work with Kasa app.
// On a mac you can run `sudo ifconfig en0 alias 10.0.0.200`
devices.push(new Device({ port: 9999, address: '10.0.0.200', model: 'hs100', data: { alias: 'Mock HS100', mac: '50:c7:bf:8f:58:18', deviceId: 'A100' } }));
devices.push(new Device({ port: 9999, address: '10.0.0.201', model: 'hs105', data: { alias: 'Mock HS105', mac: '50:c7:bf:d8:bf:d4', deviceId: 'A105' } }));
devices.push(new Device({ port: 9999, address: '10.0.0.202', model: 'hs110', data: { alias: 'Mock HS110', mac: '50:c7:bf:0d:91:8c', deviceId: 'A110' } }));
devices.push(new Device({ port: 9999, address: '10.0.0.203', model: 'hs200', data: { alias: 'Mock HS200', mac: '50:c7:bf:46:b4:24', deviceId: 'A200' } }));
devices.push(new Device({ port: 9999, address: '10.0.0.204', model: 'lb100', data: { alias: 'Mock LB100', mac: '50:c7:bf:49:ca:42', deviceId: 'BB100' } }));
devices.push(new Device({ port: 9999, address: '10.0.0.205', model: 'lb120', data: { alias: 'Mock LB120', mac: '50:c7:bf:90:9b:da', deviceId: 'BB120' } }));
devices.push(new Device({ port: 9999, address: '10.0.0.206', model: 'lb130', data: { alias: 'Mock LB130', mac: '50:c7:bf:b1:04:d3', deviceId: 'BB130' } }));

devices.forEach((d) => {
  d.start();
});

UdpServer.start();
```
