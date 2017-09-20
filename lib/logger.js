'use strict';

const logLevel = require('loglevel');
const prefix = require('loglevel-plugin-prefix');

prefix.apply(logLevel, {
  template: '[%t] %l (%n):',
  levelFormatter: function (level) { return level.charAt(0).toUpperCase(); }
});

module.exports = function ({ loggerName }) {
  let log = logLevel.getLogger(loggerName);
  log.setDefaultLevel('info');
  return log;
};
