const merge = require('lodash.merge');

const utils = require('../utils');

const { errCode } = utils;
const Hs200 = require('./hs200');

const defaultData = require('./data/hs220');

class Hs220 extends Hs200 {
  constructor(data) {
    super(data);
    merge(this.data, defaultData);

    this.api.netif.get_stainfo = errCode(() => {
      return {
        ...this.data.netif.stainfo,
        rssi: this.data.system.sysinfo.rssi,
      };
    });

    this.api['smartlife.iot.dimmer'] = {
      set_brightness: errCode(({ brightness }) => {
        if (brightness <= 0) {
          throw { err_code: -3, err_msg: 'invalid argument' }; // eslint-disable-line no-throw-literal
        }
        this.data.system.sysinfo.brightness = brightness;
      }),

      get_default_behavior: errCode(() => {
        return this.data.default_behavior;
      }),

      // eslint-disable-next-line no-unused-vars
      set_dimmer_transition: errCode(({ brightness, mode, duration }) => {
        this.data.system.sysinfo.brightness = brightness;
      }),

      get_dimmer_parameters: errCode(() => {
        return this.data.dimmer_parameters;
      }),

      set_double_click_action: errCode((params) => {
        this.data.default_behavior.double_click = params;
      }),

      set_fade_off_time: errCode(({ fadeTime }) => {
        this.data.dimmer_parameters.fadeOffTime = fadeTime;
      }),

      set_fade_on_time: errCode(({ fadeTime }) => {
        this.data.dimmer_parameters.fadeOnTime = fadeTime;
      }),

      set_gentle_off_time: errCode(({ duration }) => {
        this.data.dimmer_parameters.gentleOffTime = duration;
      }),

      set_gentle_on_time: errCode(({ duration }) => {
        this.data.dimmer_parameters.gentleOnTime = duration;
      }),

      set_long_press_action: errCode((params) => {
        this.data.default_behavior.long_press = params;
      }),

      set_switch_state: this.api.system.set_relay_state,
    };
  }
}

module.exports = Hs220;
