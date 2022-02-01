/* eslint-disable camelcase */

const defaultsDeep = require('lodash.defaultsdeep');

const utils = require('../utils');

const { errCode } = utils;

const defaultData = require('./data/base');

class Base {
  constructor(data = {}) {
    this.data = defaultsDeep(data, defaultData);

    this.api = {
      system: {
        get_sysinfo: errCode(() => {
          return this.sysinfo;
        }),
      },
      cnCloud: {
        get_info: errCode(() => {
          return this.data.cnCloud.info;
        }),
      },
      netif: {
        // eslint-disable-next-line no-unused-vars
        get_scaninfo: errCode(({ refresh, timeout }) => {
          return this.data.netif.scaninfo;
        }),
        // eslint-disable-next-line no-unused-vars
        set_stainfo: errCode(({ ssid, password, key_type }) => {
          return {};
        }),
      },
      context: {
        child_ids: errCode(() => {
          // noop
        }),
      },
    };
  }

  get sysinfo() {
    return this.data.system.sysinfo;
  }

  get emeterContext() {
    return this.data.emeter;
  }

  get scheduleContext() {
    return this.data.schedule;
  }

  get alias() {
    if (this.currentContext && this.currentContext[0]) {
      return this.currentContext[0].sysinfo.alias;
    }
    return this.data.system.sysinfo.alias;
  }

  set alias(value) {
    if (this.contextError) throw this.contextError;

    if (this.currentContext && this.currentContext[0]) {
      this.currentContext[0].sysinfo.alias = value;
      return;
    }
    this.data.system.sysinfo.alias = value;
  }

  get deviceId() {
    return this.data.system.sysinfo.deviceId;
  }

  set deviceId(value) {
    this.data.system.sysinfo.deviceId = value;
  }

  get hwId() {
    return this.data.system.sysinfo.hwId;
  }

  set hwId(value) {
    this.data.system.sysinfo.hwId = value;
  }

  get oemId() {
    return this.data.system.sysinfo.oemId;
  }

  set oemId(value) {
    this.data.system.sysinfo.oemId = value;
  }

  get latitude() {
    if (this.data.system.sysinfo.latitude !== null) {
      return this.data.system.sysinfo.latitude;
    }
    if (this.data.system.sysinfo.latitude_i !== null) {
      return this.data.system.sysinfo.latitude_i / 10000;
    }
    return undefined;
  }

  set latitude(value) {
    this.data.system.sysinfo.latitude = value;
    this.data.system.sysinfo.latitude_i = Math.round(value * 10000);
  }

  get longitude() {
    if (this.data.system.sysinfo.longitude !== null) {
      return this.data.system.sysinfo.longitude;
    }
    if (this.data.system.sysinfo.longitude_i !== null) {
      return this.data.system.sysinfo.longitude_i / 10000;
    }
    return undefined;
  }

  set longitude(value) {
    this.data.system.sysinfo.longitude = value;
    this.data.system.sysinfo.longitude_i = Math.round(value * 10000);
  }

  reset() {
    this.currentContext = null;
    this.contextError = null;
  }

  initDefaults() {
    this.alias = this.data.alias || `Mock ${this.data.model}`;
    if (this.data.deviceId) this.deviceId = this.data.deviceId;

    if (!this.deviceId) {
      this.deviceId = utils.generateId(40);
    }
    if (!this.hwId) {
      this.hwId = utils.generateId(32);
    }
    if (!this.fwId) {
      this.fwId = utils.generateId(32);
    }
    if (!this.oemId) {
      this.oemId = utils.generateId(32);
    }
    if (!this.latitude) {
      this.latitude = utils.randomLatitude();
    }
    if (!this.longitude) {
      this.longitude = utils.randomLongitude();
    }
  }
}

module.exports = Base;
