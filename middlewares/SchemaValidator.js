/* middlewares/SchemaValidator.js */

const _ = require('lodash');
const Joi = require('joi');
const UserSchema = require('../lib/userSchema');
const AdminSchema = require('../lib/adminSchema');
const utils = require('../lib/utils');

const responseMessages = require('../constants/responseMessages');
const responseCodes = require('../constants/responseCodes');

module.exports = (schemaType = 'user', useJoiError = false) => {
  const schemaMap = {
    admin: AdminSchema,
    user: UserSchema,
  };

  const Schemas = schemaMap[schemaType];

  // useJoiError determines if we should respond with the base Joi error
  // boolean: defaults to false
  const _useJoiError = _.isBoolean(useJoiError) && useJoiError;

  // enabled HTTP methods for request data validation
  const _supportedMethods = ['get', 'post', 'put'];

  // Joi validation options
  const _validationOptions = {
    abortEarly: false, // abort after the last validation error
    allowUnknown: true, // allow unknown keys that will be ignored
    stripUnknown: true // remove unknown keys from the validated data
  };

  // return the validation middleware
  return (req, res, next) => {
    const route = req.route.path;
    const method = req.method.toLowerCase();

    if (_.includes(_supportedMethods, method) && _.has(Schemas, method)) {
      // get schema for the current route
      const _methodSchemas = _.get(Schemas, method);
      const _schema = _.get(_methodSchemas, route);
      const _dataPath = method === 'get' ? req.query : req.body;

      if (_schema) {
        // Validate req.body using the schema and validation options
        return Joi.validate(
          _dataPath,
          _schema,
          _validationOptions,
          (err, data) => {
            if (err) {
              // Joi Error
              const JoiError = {
                original: err._object,

                // fetch only message and type from each error
                details: _.map(err.details, ({ message, type }) => ({
                  message: message.replace(/['"]/g, ''),
                  type
                }))
              };

              // Custom Error
              utils.sendError(
                res,
                responseMessages.invalidParams(JoiError.details),
                responseCodes.invalidParams,
                422,
                JoiError
              );

              // Send back the JSON error response
              //   res.status(422).json(_useJoiError ? JoiError : CustomError);
            } else {
              // Replace req.body with the data after Joi validation
              req.body = data;
              next();
            }
          }
        );
      }
    }

    next();
  };
};