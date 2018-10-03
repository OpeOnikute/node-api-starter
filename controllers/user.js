const User = require('../models/users');

const utils = require('../lib/utils');

const baseController = require('../controllers/base');
const responseMessages = require('../constants/responseMessages');
const responseCodes = require('../constants/responseCodes');

const userHandler = require('../handlers/userHandler');

module.exports = {
  /**
   * Endpoint to create a user
   * @param req
   * @param res
   * @returns {*}
   */
  createUser: (req, res) => {
    let params = req.body;

    //Check if a user with that email already exists
    userHandler
      .getUserByEmail(params.email)
      .then(existingUser => {
        utils.sendError(
          res,
          responseMessages.paramAlreadyExists('user', 'email'),
          responseCodes.paramAlreadyExists,
          400
        );
      })
      .catch(err => {
        if (err) {
          return utils.sendError(
            res,
            responseMessages.internalServerError,
            responseCodes.internalServerError,
            500,
            err
          );
        }

        const user = new User({
          firstName: params.firstName,
          lastName: params.lastName,
          password: params.password,
          email: params.email
        });

        baseController.saveModelObj(
          res,
          user,
          responseMessages.paramsNotCreated('user'),
          responseCodes.paramsNotCreated,
          true,
          true
        );
      });
  },

  getAllUsers: (req, res) => {
    User.find({})
      .exec()
      .then(users => {
        if (!users.length) {
          return utils.sendError(
            res,
            responseMessages.noParamFound('user'),
            responseCodes.noParamFound,
            400
          );
        }

        utils.sendSuccess(res, users);
      })
      .catch(err => {
        return utils.sendError(
          res,
          responseMessages.internalServerError,
          responseCodes.internalServerError,
          500,
          err
        );
      });
  },

  /**
   * Endpoint to update a user's details
   * @param req
   * @param res
   */
  updateUser: (req, res) => {
    const userId = req.user._id;

    const skipUpdate = ['status', 'createdAt', 'updatedAt'];

    userHandler.getUserById(res, userId, true, user => {
      if (!user) {
        return;
      }

      baseController.updateModelObj(
        res,
        req.body,
        user,
        skipUpdate,
        true,
        true
      );
    });
  }
};
