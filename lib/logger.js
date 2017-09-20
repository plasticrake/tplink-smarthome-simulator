'use strict';

const logLevel = require('loglevel');
const prefix = require('loglevel-plugin-prefix');

prefix.apply(logLevel, {
  template: '[%t] %l (%n):',
  levelFormatter: function (level) { return level.charAt(0).toUpperCase(); }
});

module.exports = function ({ loggerName } = {}) {
  let log;
  if (loggerName) {
    log = logLevel.getLogger(loggerName);
  } else {
    log = logLevel;
  }
  log.setDefaultLevel('info');
  return log;
};
