const merge = require('lodash.merge');

const utils = require('../utils');

const { errCode } = utils;
const Hs100 = require('./hs100');

const defaultData = require('./data/hs105');

class Hs105 extends Hs100 {
  constructor(data) {
    super(data);
    merge(this.data, defaultData);

    this.api.system.get_dev_icon = errCode(() => {
      throw { err_code: -2, err_msg: 'software not support' }; // eslint-disable-line no-throw-literal
    });
  }
}

module.exports = Hs105;
