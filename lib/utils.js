const crypto = require('crypto');

function errCode (fn) {
  return (...args) => {
    try {
      let ret = fn(...args);
      if (ret == null) { ret = {}; }
      return Object.assign(ret, {err_code: 0});
    } catch (err) {
      let err_code = (err.err_code == null ? -1 : err.err_code); // eslint-disable-line camelcase
      let err_msg = (err.err_msg == null ? err : err.err_msg) + ''; // eslint-disable-line camelcase
      return { err_code, err_msg };
    }
  };
}

function randomMac (prefix) {
  var mac = prefix || '50:C7:BF';

  for (var i = 0; i < 6; i++) {
    if (i % 2 === 0) mac += ':';
    mac += Math.floor(Math.random() * 16).toString(16);
  }

  return mac;
}

function generateId (len) {
  return crypto.randomBytes(len / 2).toString('hex').toUpperCase();
}

function randomInt (min, max) {
  // The maximum is inclusive and the minimum is inclusive
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat (min, max) {
  return Math.random() * (max - min) + min;
}

function randomLatitude ({fixed = 4, min = -90, max = 90} = {}) {
  return randomFloat(min, max).toFixed(fixed);
}

function randomLongitude ({fixed = 4, min = -180, max = 180} = {}) {
  return randomFloat(min, max).toFixed(fixed);
}

function getDaysInMonth (year, month) {
  var date = new Date(year, month - 1, 1);
  var result = [];
  while (date.getMonth() === month - 1) {
    result.push(date.getDate());
    date.setDate(date.getDate() + 1);
  }
  return result;
}

function generateDayList (year, month, callback) {
  let dayList = [];
  getDaysInMonth(year, month).forEach((day) => {
    let item = { year, month, day };
    if (typeof callback === 'function') {
      Object.assign(item, callback(year, month, day));
    }
    dayList.push(item);
  });
  return dayList;
}

function mergeDayLists (target = [], source = []) {
  source.forEach((s) => {
    let t = target.find((t) => { return (t.year === s.year && t.month === s.month & t.day === s.day); });
    if (t) {
      t = s;
    } else {
      target.push(s);
    }
  });
  return target;
}

module.exports = {
  errCode,
  randomMac,
  generateId,
  randomInt,
  randomFloat,
  randomLatitude,
  randomLongitude,
  getDaysInMonth,
  generateDayList,
  mergeDayLists
};
