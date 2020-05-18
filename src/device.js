'use strict';

const { encrypt, encryptWithHeader } = require('tplink-smarthome-crypto');

const {
  parseJsonStream,
  randomInt
} = require('./utils');
const DeviceNetworking = require('./device-networking');

class Device {
  constructor ({
    model,
    port = 0,
    address = '0.0.0.0',
    alias,
    responseDelay = 0,
    unreliablePercent = 0,
    data = {}
  } = {}) {
    this.deviceNetworking = new DeviceNetworking({
      device: this,
      model,
      port,
      address,
      responseDelay
    });

    this.model = model;
    this.data = Object.assign({}, data);
    this.data.model = model;
    if (!alias == null) this.data.alias = alias;

    let SpecificDevice = require(`./devices/${model}`);
    this._deviceInfo = new SpecificDevice(this.data);
    this._deviceInfo.initDefaults();
    this.api = this._deviceInfo.api;
    this.data = this._deviceInfo.data;

    this.unreliablePercent = unreliablePercent;
  }

  get address () {
    return this.deviceNetworking.address;
  }

  get port () {
    return this.deviceNetworking.port;
  }

  async start () {
    return this.deviceNetworking.start();
  }

  async stop () {
    return this.deviceNetworking.stop();
  }

  get children () {
    return this._deviceInfo.children;
  }

  processMessage (msg, encryptFn, customizerFn) {
    const responseObj = processCommands(msg, this.api, customizerFn);
    let responseJson;
    let response;
    const badData = unreliableData(this.unreliablePercent);
    if (badData !== undefined) {
      responseJson = badData;
      response = badData;
    } else if (responseObj) {
      responseJson = JSON.stringify(responseObj);
      response = encryptFn(responseJson);
    }

    return { response, responseForLog: responseJson };
  }

  processUdpMessage (msg) {
    return this.processMessage(msg, encrypt, (obj) => {
      // UDP only returns last two characters of child.id
      if (
        obj.system &&
        obj.system.get_sysinfo &&
        obj.system.get_sysinfo.children &&
        obj.system.get_sysinfo.children.length > 0
      ) {
        obj.system.get_sysinfo.children.map((child) => {
          child.id = child.id.slice(-2);
          return child;
        });
      }
      return obj;
    });
  }

  processTcpMessage (msg) {
    return this.processMessage(msg, encryptWithHeader);
  }
}

Device.models = [
  'hs100',
  'hs105',
  'hs110',
  'hs110v2',
  'hs200',
  'hs220',
  'hs300',
  'lb100',
  'lb120',
  'lb130'
];

const unreliableData = function (unreliablePercent) {
  if (unreliablePercent > 0 && Math.random() < unreliablePercent) {
    let bufLength = randomInt(0, 255);
    let buf = Buffer.alloc(bufLength);
    for (var i = 0; i < buf.length; i++) {
      buf[i] = randomInt(0, 255);
    }
    return buf;
  }
};

const processCommands = function (json, api, customizerFn) {
  if (customizerFn == null) {
    customizerFn = (moduleName, methodName, methodResponse) => {
      return methodResponse;
    };
  }
  const response = [];

  const commandFragments = parseJsonStream(json);
  let contextResults;

  // Run context command first (if found), save other commands for after
  for (const module of commandFragments) {
    if (module.name === 'context') {
      let childIds = module.methods.find((v) => v.method === 'child_ids');
      if (childIds !== undefined) {
        contextResults = api.context.child_ids(childIds);
        break;
      }
    }
  }

  for (const module of commandFragments) {
    if (api[module.name]) {
      for (const method of module.methods) {
        if (typeof api[module.name][method.name] === 'function') {
          if (module.name === 'context' && method.name === 'child_ids') {
            method.results = contextResults;
          } else {
            method.results = customizerFn(
              module.name,
              method.name,
              api[module.name][method.name](method.args)
            );
          }
        } else {
          method.results = { err_code: -2, err_msg: 'member not support' };
        }
      }
    } else {
      module.results = { err_code: -1, err_msg: 'module not support' };
    }

    if (module.results) {
      response.push(`"${module.name}":${JSON.stringify(module.results)}`);
    } else {
      const methodsResponse = module.methods.map((method) => {
        return `"${method.name}":${JSON.stringify(method.results)}`;
      });

      response.push(`"${module.name}":{${methodsResponse.join(',')}}`);
    }
  }

  return `{${response.join(',')}}`;
};

// const processCommand = function (command, api, depth = 0) {
//   let results = {};
//   let keys = Object.keys(command);

//   // if includes context, call it first so rest of commands will have context set
//   if (depth === 0 && command.context && command.context.child_ids) {
//     let contextResults = api.context.child_ids(command.context.child_ids);
//     if (contextResults.err_code !== 0) {
//       results['context'] = contextResults;
//     }
//   }

//   for (var i = 0; i < keys.length; i++) {
//     let key = keys[i];
//     if (key === 'context') {
//       continue; // already processed above
//     }
//     if (typeof api[key] === 'function') {
//       results[key] = api[key](command[key]);
//     } else if (api[key]) {
//       results[key] = processCommand(command[key], api[key], depth + 1);
//     } else {
//       if (depth === 0) {
//         results[key] = { err_code: -1, err_msg: 'module not support' };
//       } else {
//         results[key] = { err_code: -2, err_msg: 'member not support' };
//       }
//     }
//   }
//   return results;
// };

module.exports = { Device, processCommands };
