const User = require('../models/users');
const utils = require('../lib/utils');
const responseMessages = require('../constants/responseMessages');
const responseCodes = require('../constants/responseCodes');
const constants = require('../constants/constants');

class UserHandler {
  constructor() {}
  /**
   * @param res
   * @param userId
   * @param sendError
   * @param options
   * @param callback
   */
  static getUserById(res, userId, sendError, callback, options) {
    User.findById(userId, '-password')
      .populate('programme')
      .lean(options ? options.lean || false : false)
      .exec()
      .then(user => {
        if (!user) {
          if (sendError) {
            utils.sendError(
              res,
              responseMessages.paramNotFound('user'),
              responseCodes.paramNotFound,
              404
            );
            return;
          }

          callback(false);
          return;
        }

        callback(user);
      })
      .catch(err => {
        if (err) {
          if (sendError) {
            utils.sendError(
              res,
              responseMessages.internalServerError,
              responseCodes.internalServerError,
              500,
              err
            );
            return;
          }

          callback(false);
        }
      });
  }

  /**
   * @param email
   * @param options
   */
  static getUserByEmail(email, options) {
    return new Promise((resolve, reject) => {
      User.findOne({ email: email })
        .lean(options ? options.lean || false : false)
        .exec()
        .then(user => {
          console.log(user);
          if (!user) {
            return reject(null);
          }
          resolve(user);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
}

module.exports = UserHandler;
