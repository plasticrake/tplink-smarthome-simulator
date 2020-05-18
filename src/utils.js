/* eslint no-throw-literal: ["off"] */
'use strict';

const crypto = require('crypto');
const fs = require('fs');

const Parser = require('jsonparse');

function errCode (fn) {
  return (...args) => {
    try {
      let ret = fn(...args);
      if (ret == null) { ret = {}; }
      return Object.assign(ret, { err_code: 0 });
    } catch (err) {
      let err_code = (err.err_code == null ? -1 : err.err_code); // eslint-disable-line camelcase
      let err_msg = (err.err_msg == null ? err : err.err_msg) + ''; // eslint-disable-line camelcase
      return { err_code, err_msg };
    }
  };
}

function readJson (path, cb) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

function randomMac (prefix, delimiter = ':') {
  var mac = prefix || ['50', 'c7', 'bf'].join(delimiter);

  for (var i = 0; i < 6; i++) {
    if (i % 2 === 0) mac += delimiter;
    mac += Math.floor(Math.random() * 16).toString(16);
  }

  return mac;
}

function generateId (len) {
  return crypto.randomBytes(len / 2).toString('hex').toUpperCase();
}

function parseJsonStream (json) {
  const parser = new Parser();
  const results = [];
  let methods = [];

  parser.onValue = function (value) {
    if (this.stack.length === 2) {
      const methodName = this.key;
      methods.push({ name: methodName, args: value });
    }
    if (this.stack.length === 1) {
      const moduleName = this.key;
      results.push({ name: moduleName, methods });
      methods = [];
    }
  };

  parser.write(json);
  return results;
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

function randomLatitude ({ fixed = 4, min = -90, max = 90 } = {}) {
  return randomFloat(min, max).toFixed(fixed);
}

function randomLongitude ({ fixed = 4, min = -180, max = 180 } = {}) {
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

function getDayList (year, month, key, dayListData = [], defaultValue) {
  let dayList = [];
  if (year != null && month != null) {
    let now = new Date();
    let lastDay;
    if (now.getFullYear() === year && now.getMonth() + 1 === month) {
      lastDay = now.getDate();
    }
    getDaysInMonth(year, month).forEach((day) => {
      if (day > lastDay) return; // Don't return data for future dates
      let entry = dayListData.find((dl) => (dl.year === year && dl.month === month && dl.day === day));
      if (entry == null) {
        let def = (typeof defaultValue === 'function' ? defaultValue(year, month, day) : defaultValue);
        entry = { year, month, day, [key]: def };
        dayListData.push(entry);
      }
      dayList.push(entry);
    });
  }
  return dayList;
}

function getMonthList (year, key, dayListData = [], defaultValue) {
  let monthList = [];
  if (year != null) {
    for (var month = 1; month <= 12; month++) {
      let monthSum = getDayList(year, month, key, dayListData, defaultValue).reduce((acc, val) => (acc + val[key]), 0);
      monthList.push({ year, month, [key]: monthSum });
    }
  }
  return monthList;
}

function editRule (rules, rule) {
  if (rule.id == null) {
    throw { err_code: -3, err_msg: 'invalid argument' };
  }
  let existingRule = rules.find((r, i, a) => {
    if (r.id === rule.id) {
      a[i] = rule;
      return a[i];
    }
  });
  if (existingRule == null) {
    throw { err_code: -14, err_msg: 'entry not exist' };
  }
}

function deleteRule (rules, id) {
  if (!id) throw { 'err_code': -10002, 'err_msg': 'Missing neccesary argument' }; // cspell:disable-line // Typo on purpose
  let rule = rules.find((r, i, a) => {
    if (r.id === id) {
      a.splice(i, 1); // remove rule
      return true;
    }
  });
  if (rule == null) {
    throw { err_code: -14, err_msg: 'entry not exist' };
  }
}

module.exports = {
  errCode,
  randomMac,
  generateId,
  parseJsonStream,
  randomInt,
  randomFloat,
  randomLatitude,
  randomLongitude,
  getDayList,
  getMonthList,
  editRule,
  deleteRule,
  readJson
};
