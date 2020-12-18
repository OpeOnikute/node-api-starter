/* schemas.js */

// load Joi module
const Joi = require('joi');

// accepts name only as letters
const name = Joi.string().trim().regex(/^[a-zA-Z\-]+$/);

const loginSchema = Joi.object()
  .keys({
    email: Joi.string()
      .email()
      .lowercase()
      .required(),
    password: Joi.string()
      .required()
      .strict()
  });

const createAdminSchema = Joi.object()
.keys({
    firstName: name.required(),
    lastName: name.required(),
    email: Joi.string()
        .email()
        .lowercase()
        .required(),
    password: Joi.string()
        .min(5)
        .required()
        .strict(),
    adminRole: Joi.string()
      .required()
      .valid([0, 1, 2, 3])
});

// export the schemas
module.exports = {
    'post': {
        '/login': loginSchema,
        '/create': createAdminSchema
    }
};
