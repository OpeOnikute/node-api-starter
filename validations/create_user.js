'use strict';

const joi = require('joi');

module.exports = joi
  .object()
  .keys({
    username: joi
      .string()
      .alphanum()
      .min(4)
      .max(15)
      .required()
  })
  .required();
