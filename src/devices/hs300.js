'use strict';

const defaultsDeep = require('lodash.defaultsdeep');

const utils = require('../utils');
const errCode = utils.errCode;
const Hs = require('./hs');

const debug = require('debug');

const defaultData = require('./data/hs300');

const logDebug = debug('DEBUG');

class Hs300 extends Hs {
  constructor (data) {
    super(data);
    defaultsDeep(this.data, defaultData);

    this.realtimeV2 = true;

    this.api['smartlife.iot.smartpowerstrip.manage'] = {
      get_relationship: errCode(() => {
        const data = [];
        let slot = 0;
        for (var childId in this.data.children) {
          data.push({ child_id: childId, hw_slot: slot });
          slot++;
        }
        return { data };
      })
    };

    this.api.context.child_ids = errCode((children) => {
      logDebug('context.child_ids', children);
      if (children == null || !Array.isArray(children)) {
        throw { err_code: -3, err_msg: 'invalid argument' }; // eslint-disable-line no-throw-literal
      }
      if (children.length === 0) {
        return;
      }
      const childId = children[0];
      this.currentContext = this.data.children[childId];
      if (this.currentContext == null) {
        throw { err_code: -14, err_msg: 'entry not exist' }; // eslint-disable-line no-throw-literal
      }
    });

    this.api.netif.get_stainfo = errCode(() => {
      return Object.assign({}, this.data.netif.stainfo, { rssi: this.data.system.sysinfo.rssi });
    });
  }

  initDefaults () {
    super.initDefaults();

    for (var childId in this.data.children) {
      const child = this.data.children[childId];
      child.sysinfo.id = this.deviceId + childId;
      child.emeter = JSON.parse(JSON.stringify(this.data.emeter));
      child.schedule = JSON.parse(JSON.stringify(this.data.schedule));
      child.anti_theft = JSON.parse(JSON.stringify(this.data.anti_theft));
      child.count_down = JSON.parse(JSON.stringify(this.data.count_down));
      this.data.children[child.sysinfo.id] = child;
      delete this.data.children[childId];
    }

    this.currentContext = this.data.children[this.deviceId + '00'];
  }

  get currentContext () {
    logDebug('get currentContext', this._currentContext);
    return this._currentContext;
  }
  set currentContext (child) {
    this._currentContext = child;
    logDebug('set currentContext', this._currentContext);
  }

  get children () {
    const children = [];
    for (var childId in this.data.children) {
      children.push(this.data.children[childId].sysinfo);
    }
    return children;
  }

  get sysinfo () {
    const sysinfo = JSON.parse(JSON.stringify(this.data.system.sysinfo));
    sysinfo.children = JSON.parse(JSON.stringify(this.children));
    return sysinfo;
  }

  get emeterContext () {
    return this.currentContext.emeter;
  }

  get scheduleContext () {
    return this.currentContext.schedule;
  }

  get antiTheftContext () {
    return this.currentContext.anti_theft;
  }

  get countDownContext () {
    return this.currentContext.count_down;
  }

  get relayState () {
    return this.currentContext.sysinfo.state;
  }

  set relayState (relayState) {
    this.currentContext.sysinfo.state = relayState;
  }
}

module.exports = Hs300;
