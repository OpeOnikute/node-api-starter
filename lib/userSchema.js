/* schemas.js */

// load Joi module
const Joi = require('joi');

// accepts name only as letters
const name = Joi.string().regex(/^[A-Z]+$/);

// accepts a valid UUID v4 string as id
const personID = Joi.string().guid({ version: 'uuidv4' });

const personDataSchema = Joi.object()
  .keys({
    firstName: name,
    lastName: name,
    email: Joi.string()
      .email()
      .lowercase()
      .required(),
    password: Joi.string()
      .min(5)
      .required()
      .strict()
  })
  // firstname and lastname must always appear together
  .and('firstName', 'lastName');

const loginSchema = Joi.object()
  .keys({
    email: Joi.string()
      .email()
      .lowercase()
      .required(),
    password: Joi.string()
      .min(5)
      .required()
      .strict()
  })

const forgotPwdSchema = Joi.object()
.keys({
    email: Joi.string()
    .email()
    .lowercase()
    .required()
})

const changePwdSchema = Joi.object()
.keys({
    password: Joi.string().required(),
    resetToken: Joi.string().required()
});

// export the schemas
module.exports = {
  '/': personDataSchema,
  '/login': loginSchema,
  '/forgot-password': forgotPwdSchema,
  '/change-password': changePwdSchema
};
