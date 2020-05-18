const base = require('./base');

const hs = { ...base };
module.exports = hs;

Object.assign(hs, {
  emeter: {
    realtime: {
      current: 0.1256,
      voltage: 122.049119,
      power: 3.14,
      total: 51.493,
    },
    daystat: {
      day_list: [],
    },
    get_vgain_igain: {
      vgain: 13255,
      igain: 16489,
    },
  },
});
