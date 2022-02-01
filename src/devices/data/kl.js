const base = require('./base');

const kl = { ...base };
module.exports = kl;

Object.assign(kl, {
  cnCloud: {
    info: {
      username: '',
      server: 'n-devs.tplinkcloud.com',
      binded: 0,
      cld_connection: 1,
      illegalType: 0,
      stopConnect: 0,
      tcspStatus: 1,
      fwDlPage: '',
      tcspInfo: '',
      fwNotifyType: -1,
      err_code: 0,
    },
  },

  emeter: {
    realtime: {
      power_mw: 10800,
    },
    daystat: {
      day_list: [],
    },
  },

  'smartlife.iot.lightStrip': {
    fade_on_off: { fadeOnTime: 500, fadeOffTime: 500 },

    light_state: {
      transition: 0,
      length: 16,
      on_off: 0,
      dft_on_state: { mode: 'normal', groups: [[0, 15, 0, 0, 100, 9000]] },
    },

    dft_on_state: {
      mode: 'normal',
      hue: 0,
      saturation: 0,
      color_temp: 9000,
      brightness: 100,
      groups: [[0, 15, 0, 0, 100, 9000]],
    },

    get_light_details: {
      lamp_beam_angle: 270,
      min_voltage: 100,
      max_voltage: 120,
      wattage: 17,
      incandescent_equivalent: 100,
      max_lumens: 1400,
      color_rendering_index: 85,
    },

    get_default_behavior: {
      soft_on: {
        mode: 'last_status',
      },
      hard_on: {
        mode: 'last_status',
      },
      err_code: 0,
    },
  },
});
