/* eslint no-throw-literal: ["off"] */

const crypto = require('crypto');
const fs = require('fs');

const Parser = require('jsonparse');

function errCode(fn) {
  return (...args) => {
    try {
      let ret = fn(...args);
      if (ret == null) {
        ret = {};
      }
      return Object.assign(ret, { err_code: 0 });
    } catch (err) {
      const err_code = err.err_code == null ? -1 : err.err_code; // eslint-disable-line camelcase
      const err_msg = `${err.err_msg == null ? err : err.err_msg}`; // eslint-disable-line camelcase
      return { err_code, err_msg };
    }
  };
}

function readJson(path) {
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

function randomMac(prefix, delimiter = ':') {
  let mac = prefix || ['50', 'c7', 'bf'].join(delimiter);

  for (let i = 0; i < 6; i += 1) {
    if (i % 2 === 0) mac += delimiter;
    mac += Math.floor(Math.random() * 16).toString(16);
  }

  return mac;
}

function generateId(len) {
  return crypto
    .randomBytes(len / 2)
    .toString('hex')
    .toUpperCase();
}

function parseJsonStream(json) {
  const parser = new Parser();
  const results = [];
  let methods = [];

  parser.onValue = function onValue(value) {
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

/**
 *
 * Commands appear to be processed in order with the exception of "context.child_ids" which is handled specially.
 *
 * - When multiple duplicate commands are sent, the last command "wins":
 *   `{"system":{"set_relay_state":{"state":0}},"system":{"set_relay_state":{"state":1}}}`
 *   will turn on the relay
 * - If multiple "context" modules are specified, the first is processed and not displayed in the output, the remaining items return an error:
 *   `"context":{"err_code":-1,"err_msg":"module not support"}`
 * - Devices that do not have multiple children will still silently ignore the first context found and all methods will still work
 * - Some methods support multiple child_ids (`set_relay_state`), some only act on the first child_id (`set_dev_alias`)
 * - `context:{}` or `context:[]` or `context:{"something_unexpected":[]}` has no effect, behaves as if no `context` was given (if first occurrence).
 * - `context:""` crashes my device!
 * - `context:{child_ids:{}}` or `context:{child_ids:[1]` will return `{ err_code: -3, err_msg: 'invalid argument' }` for commands that support child_id, but other commands will run as normal.
 * - `context:{child_ids:[]}` will run commands that support child_id but they will have no effect (applied to zero children).
 * - `context:{child_ids:["A"]}` will return `{ err_code: -14, err_msg: 'entry not exist' }` for commands that support child_id, but other commands will run as normal.
 * - if any of the `child_ids` are invalid or don't exist commands that support `child_ids` will not run the valid ones and will return an `err_code`
 *
 * @param {string} json
 * @param {Object} api
 * @param {Function} [customizerFn]
 * @returns {string}
 */
function processCommands(json, api, errors, customizerFn) {
  if (customizerFn == null) {
    // eslint-disable-next-line no-param-reassign
    customizerFn = (moduleName, methodName, methodResponse) => {
      return methodResponse;
    };
  }
  const response = [];

  const commandFragments = parseJsonStream(json);

  // Run context command first (if found), save other commands for after
  let foundFirstContext = false;
  commandFragments
    .reduce((acc, module) => {
      if (module.name === 'context' && !foundFirstContext) {
        foundFirstContext = true;
        if ('context' in api && 'child_ids' in api.context) {
          const childIds = module.methods.find((v) => v.name === 'child_ids')
            .args;
          if (childIds !== undefined) {
            api.context.child_ids(childIds);
          }
        }
      } else {
        acc.push(module);
      }
      return acc;
    }, [])
    .forEach((module) => {
      if (api[module.name] && module.name !== 'context') {
        for (const method of module.methods) {
          if (typeof api[module.name][method.name] === 'function') {
            method.results = customizerFn(
              module.name,
              method.name,
              api[module.name][method.name](method.args)
            );
          } else {
            method.results = errors.METHOD_NOT_SUPPORT;
          }
        }
      } else {
        // eslint-disable-next-line no-param-reassign
        module.results = errors.MODULE_NOT_SUPPORT;
      }

      if (module.results) {
        response.push(`"${module.name}":${JSON.stringify(module.results)}`);
      } else {
        const methodsResponse = module.methods.map((method) => {
          return `"${method.name}":${JSON.stringify(method.results)}`;
        });

        response.push(`"${module.name}":{${methodsResponse.join(',')}}`);
      }
    });

  return `{${response.join(',')}}`;
}

function randomInt(min, max) {
  // The maximum is inclusive and the minimum is inclusive
  const pMin = Math.ceil(min);
  const pMax = Math.floor(max);
  return Math.floor(Math.random() * (pMax - pMin + 1)) + pMin;
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function randomLatitude({ fixed = 4, min = -90, max = 90 } = {}) {
  return randomFloat(min, max).toFixed(fixed);
}

function randomLongitude({ fixed = 4, min = -180, max = 180 } = {}) {
  return randomFloat(min, max).toFixed(fixed);
}

function getDaysInMonth(year, month) {
  const date = new Date(year, month - 1, 1);
  const result = [];
  while (date.getMonth() === month - 1) {
    result.push(date.getDate());
    date.setDate(date.getDate() + 1);
  }
  return result;
}

function getDayList(year, month, key, dayListData = [], defaultValue) {
  const dayList = [];
  if (year != null && month != null) {
    const now = new Date();
    let lastDay;
    if (now.getFullYear() === year && now.getMonth() + 1 === month) {
      lastDay = now.getDate();
    }
    getDaysInMonth(year, month).forEach((day) => {
      if (day > lastDay) return; // Don't return data for future dates
      let entry = dayListData.find(
        (dl) => dl.year === year && dl.month === month && dl.day === day
      );
      if (entry == null) {
        const def =
          typeof defaultValue === 'function'
            ? defaultValue(year, month, day)
            : defaultValue;
        entry = { year, month, day, [key]: def };
        dayListData.push(entry);
      }
      dayList.push(entry);
    });
  }
  return dayList;
}

function getMonthList(year, key, dayListData = [], defaultValue) {
  const monthList = [];
  if (year != null) {
    for (let month = 1; month <= 12; month += 1) {
      const monthSum = getDayList(
        year,
        month,
        key,
        dayListData,
        defaultValue
      ).reduce((acc, val) => acc + val[key], 0);
      monthList.push({ year, month, [key]: monthSum });
    }
  }
  return monthList;
}

function editRule(rules, rule) {
  if (rule.id == null) {
    throw { err_code: -3, err_msg: 'invalid argument' };
  }
  const existingRule = rules.find((r, i, a) => {
    if (r.id === rule.id) {
      // eslint-disable-next-line no-param-reassign
      a[i] = rule;
      return a[i];
    }
    return false;
  });
  if (existingRule == null) {
    throw { err_code: -14, err_msg: 'entry not exist' };
  }
}

function deleteRule(rules, id) {
  if (!id) throw { err_code: -10002, err_msg: 'Missing neccesary argument' }; // cspell:disable-line // Typo on purpose
  const rule = rules.find((r, i, a) => {
    if (r.id === id) {
      a.splice(i, 1); // remove rule
      return true;
    }
    return false;
  });
  if (rule == null) {
    throw { err_code: -14, err_msg: 'entry not exist' };
  }
}

function unreliableData(unreliablePercent) {
  if (unreliablePercent > 0 && Math.random() < unreliablePercent) {
    const bufLength = randomInt(0, 255);
    const buf = Buffer.alloc(bufLength);
    for (let i = 0; i < buf.length; i += 1) {
      buf[i] = randomInt(0, 255);
    }
    return buf;
  }
  return undefined;
}

module.exports = {
  errCode,
  randomMac,
  generateId,
  parseJsonStream,
  processCommands,
  randomInt,
  randomFloat,
  randomLatitude,
  randomLongitude,
  getDayList,
  getMonthList,
  editRule,
  deleteRule,
  readJson,
  unreliableData,
};
