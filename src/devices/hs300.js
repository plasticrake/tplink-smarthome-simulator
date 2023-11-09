/* eslint-disable no-underscore-dangle */
const debug = require('debug');
const defaultsDeep = require('lodash.defaultsdeep');

const utils = require('../utils');

const { errCode } = utils;
const Hs = require('./hs');

const defaultData = require('./data/hs300');

const logDebug = debug('tplink-simulator:DEBUG');

class Hs300 extends Hs {
  constructor(data) {
    super(data);
    defaultsDeep(this.data, defaultData);

    this.realtimeV2 = true;

    this.api['smartlife.iot.smartpowerstrip.manage'] = {
      get_relationship: errCode(() => {
        let slot = -1;

        return {
          data: Object.keys(this.data.children).map((childId) => {
            slot += 1;
            return { child_id: childId, hw_slot: slot };
          }),
        };
      }),
    };

    this.api.context.child_ids = (childIds) => {
      logDebug('context.child_ids', childIds);
      this.currentContext = [];

      if (childIds == null || !Array.isArray(childIds)) {
        this.contextError = this.constructor.error.INVALID_ARGUMENT;
        return;
      }
      if (childIds.length === 0) {
        return;
      }

      for (const childId of childIds) {
        if (
          childId in this.data.children &&
          this.data.children[childId] != null
        ) {
          this.currentContext.push(this.data.children[childId]);
        } else {
          this.contextError = { err_code: -14, err_msg: 'entry not exist' };
          return;
        }
      }

      if (this.currentContext.length === 0) {
        this.contextError = { err_code: -14, err_msg: 'entry not exist' };
      }
    };

    this.api.netif.get_stainfo = errCode(() => {
      return {
        ...this.data.netif.stainfo,
        rssi: this.data.system.sysinfo.rssi,
      };
    });
  }

  initDefaults() {
    super.initDefaults();

    Object.keys(this.data.children).forEach((childId) => {
      const child = this.data.children[childId];
      child.sysinfo.id = this.deviceId + childId;
      child.emeter = JSON.parse(JSON.stringify(this.data.emeter));
      child.schedule = JSON.parse(JSON.stringify(this.data.schedule));
      child.anti_theft = JSON.parse(JSON.stringify(this.data.anti_theft));
      child.count_down = JSON.parse(JSON.stringify(this.data.count_down));
      this.data.children[child.sysinfo.id] = child;
      delete this.data.children[childId];
    });
  }

  get currentContext() {
    logDebug('get currentContext', this._currentContext);
    return this._currentContext;
  }

  set currentContext(child) {
    this._currentContext = child;
    logDebug('set currentContext', this._currentContext);
  }

  get children() {
    return Object.keys(this.data.children).map(
      (childId) => this.data.children[childId],
    );
  }

  get sysinfoChildren() {
    return Object.keys(this.data.children).map(
      (childId) => this.data.children[childId].sysinfo,
    );
  }

  get sysinfo() {
    const sysinfo = JSON.parse(JSON.stringify(this.data.system.sysinfo));
    sysinfo.children = JSON.parse(JSON.stringify(this.sysinfoChildren));
    return sysinfo;
  }

  get emeterContext() {
    return this.contextFirst.emeter;
  }

  get scheduleContext() {
    return this.contextFirst.schedule;
  }

  get antiTheftContext() {
    return this.contextFirst.anti_theft;
  }

  get countDownContext() {
    return this.contextFirst.count_down;
  }

  get relayState() {
    return this.contextFirst.sysinfo.state;
  }

  set relayState(relayState) {
    this.contextDefaultAll.forEach((ctx) => {
      ctx.sysinfo.state = relayState;
    });
  }

  get contextDefaultAll() {
    if (this.contextError) throw this.contextError;
    if (this.currentContext == null) return this.children;
    return this.currentContext;
  }

  get contextDefaultFirst() {
    if (this.contextError) throw this.contextError;
    if (this.currentContext == null) return [this.children[0]];
    return this.currentContext;
  }

  get contextFirst() {
    if (this.contextError) throw this.contextError;
    if (this.currentContext == null) return this.children[0];
    return this.currentContext[0];
  }
}

module.exports = Hs300;
