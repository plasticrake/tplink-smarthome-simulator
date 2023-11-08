/* eslint-disable camelcase */
const defaultsDeep = require('lodash.defaultsdeep');

const { errCode, pick, randomMac } = require('../utils');

const Base = require('./base');
const Hs = require('./hs');

const defaultData = require('./data/base');

class Kl extends Base {
  static get errors() {
    return {
      MODULE_NOT_SUPPORT: { err_code: -1, err_msg: 'module not support' },
      METHOD_NOT_SUPPORT: { err_code: -2, err_msg: 'member not support' },
      INVALID_ARGUMENT: null,
      MISSING_ARGUMENT: {
        err_code: -10002,
        /* cspell:disable-next-line */
        err_msg: 'Missing neccesary argument',
      },
    };
  }

  constructor(data) {
    super(data);
    this.hs = new Hs(data);
    this.data = defaultsDeep(data, defaultData);

    const { get_sysinfo } = this.api.system;

    this.api.system = this.hs.api.system;
    this.api.system.get_sysinfo = get_sysinfo;

    this.api['smartlife.iot.common.system'] = this.api.system;

    this.api['smartlife.iot.common.cloud'] = this.hs.api.cnCloud;

    this.api['smartlife.iot.common.schedule'] = this.hs.api.schedule;

    this.api['smartlife.iot.common.timesetting'] = this.hs.api.time;

    this.api['smartlife.iot.common.timesetting'].set_time = errCode(
      // eslint-disable-next-line no-unused-vars
      ({ year, month, mday, hour, min, sec }) => {
        // TODO
      },
    );

    this.api.netif = this.hs.api.netif;

    this.api['smartlife.iot.common.emeter'] = {
      get_realtime: errCode(() => {
        return this.hs.emeterContext.realtime;
      }),
      get_daystat: this.hs.api.emeter.get_daystat,
      get_monthstat: this.hs.api.emeter.get_monthstat,
      erase_emeter_stat: this.hs.api.emeter.erase_emeter_stat,
    };

    this.api['smartlife.iot.lightStrip'] = {
      get_fade_on_off: errCode(() => {
        return this.data['smartlife.iot.lightStrip'].fade_on_off;
      }),

      set_light_state: errCode((options) => {
        const ls = this.data['smartlife.iot.lightStrip'].light_state;

        Object.entries(options).forEach(([k, v]) => {
          switch (k) {
            case 'color_temp':
              if (
                v === 0 ||
                (v >= this.data.colorTempRange.min &&
                  v <= this.data.colorTempRange.max)
              ) {
                Object.assign(ls, { [k]: v });
              } else {
                throw { err_code: -10000, err_msg: 'Invalid input argument' }; // eslint-disable-line no-throw-literal
              }
              break;
            case 'mode':
            case 'hue':
            case 'on_off':
            case 'saturation':
            case 'brightness':
              Object.assign(ls, { [k]: v });
              break;
            default:
            // do nothing
          }
        });

        return pick(ls, ['on_off', 'mode', 'groups']);
      }),

      get_light_state: errCode(() => {
        return this.data['smartlife.iot.lightStrip'].light_state;
      }),

      get_light_details: errCode(() => {
        return this.data['smartlife.iot.lightStrip'].get_light_details;
      }),

      get_default_behavior: errCode(() => {
        return this.data['smartlife.iot.lightStrip'].get_default_behavior;
      }),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  get endSocketAfterResponse() {
    return false;
  }

  get sysinfo() {
    this.data.system.sysinfo.on_time = this.onTime;

    this.data.system.sysinfo.light_state = pick(
      this.data['smartlife.iot.lightStrip'].light_state,
      ['on_off', 'mode', 'hue', 'saturation', 'color_temp', 'brightness'],
    );

    this.data.system.sysinfo.light_state.dft_on_state = pick(
      this.data['smartlife.iot.lightStrip'].dft_on_state,
      ['mode', 'hue', 'saturation', 'color_temp', 'brightness'],
    );

    return this.data.system.sysinfo;
  }

  get mac() {
    return this.data.system.sysinfo.mic_mac;
  }

  set mac(value) {
    this.data.system.sysinfo.mic_mac = value;
  }

  initDefaults() {
    super.initDefaults();

    if (this.data.mac) this.mac = this.data.mac;

    if (!this.mac) {
      this.mac = randomMac();
    }
  }
}

module.exports = Kl;
