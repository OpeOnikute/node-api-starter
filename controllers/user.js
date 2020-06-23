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
  signup: async (req, res) => {
    let params = req.body;

    try {
      const existingUser = await userHandler.getUserByEmail(params.email);

      if (existingUser) {
        return utils.sendError(
          res,
          responseMessages.paramAlreadyExists('user', 'email'),
          responseCodes.paramAlreadyExists,
          400
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
    } catch (e) {
      console.error(e);
      if (err) {
        return utils.sendError(
          res,
          responseMessages.internalServerError,
          responseCodes.internalServerError,
          500,
          err
        );
      }
    }
  },

  /** */
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find({}).exec();
      utils.sendSuccess(res, users);
    } catch (err) {
      return utils.sendError(
        res,
        responseMessages.internalServerError,
        responseCodes.internalServerError,
        500,
        err
      );
    }
  },

  /**
   * Endpoint to update a user's details
   * @param req
   * @param res
   */
  updateUser: (req, res) => {
    const skipUpdate = ['status', 'createdAt', 'updatedAt'];

    baseController.updateModelObj(res, req.body, user, skipUpdate, true, true);
  },

    /**
   * @param req
   * @param res
   */
  login: async function(req, res) {
    let payload = req.body;

    let pass = payload.password;
    let email = payload.email;

    try {
        const user = await userHandler.getUserByEmail(email, { lean: true })
        if (!user) {
            return utils.sendError(
                res,
                responseMessages.paramNotFound("user"),
                responseCodes.paramNotFound,
                400
            );
        }

        //need to reassign the method cause the object received is lean.
        user.comparePassword = utils.comparePassword;

        // test a matching password
        const matched = await user.comparePassword(pass);
        
        if (!matched) {
            utils.sendError(
                res,
                responseMessages.failedAuthentication,
                responseCodes.failedAuthentication,
                400,
                err
            );
            return;
        }

        // restrict admin access to only the admin dashboard.
        if (user.isAdmin) {
            utils.sendError(
                res,
                responseMessages.accessDenied,
                responseCodes.accessDenied,
                400
            );
            return;
        }

        user.token = jwt.sign(user, config.secret, {
            expiresIn: "24h"
        });

        delete user["password"];

        utils.sendSuccess(res, user);

    } catch (err) {
        // TODO - send common error
        console.error(err)
        return utils.sendError(
            res,
            responseMessages.internalServerError,
            responseCodes.internalServerError,
            500,
            err
        );
    }
  },
};
