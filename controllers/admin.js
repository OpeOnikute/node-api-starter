const jwt = require('jsonwebtoken');

const User = require('../models/users');

const utils = require('../lib/utils');
const config = require('../config/config');

const baseController = require('./base');
const responseMessages = require('../constants/responseMessages');
const responseCodes = require('../constants/responseCodes');

const userHandler = require('../handlers/userHandler');

module.exports = {
    login: async (req, res) => {
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
                    400
                );
                return;
            }

            // restrict admin access to only the admin dashboard.
            if (!user.isAdmin) {
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
            utils.sendServerError(res, err);
        }
    },
    createAdmin: async (req, res) => {
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
            email: params.email,
            isAdmin: true,
            adminRole: params.adminRole
          });
    
          baseController.saveModelObj(
            res,
            user,
            responseMessages.paramsNotCreated('user'),
            responseCodes.paramsNotCreated,
            true,
            false,
            function() {
                const response = {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    adminRole: user.adminRole
                };
    
                response.token = jwt.sign({_id: user._id, email: user.email}, config.secret, {
                    expiresIn: "24h"
                });
    
                delete response["password"];
    
                utils.sendSuccess(res, response);
            }
          );
    
        } catch (err) {
            utils.sendServerError(res, err);
        }
    },
    getAllUsers: async (req, res) => {
        try {
            const { page, draw, start, length } = req.query;
            var options = {
                select:   'firstName lastName email createdAt',
                sort:     { createdAt: -1},
                lean:     true,
                limit:    Number(length) || config.adminPaginateLimit
            };

            // use either the page or offset, but not both.
            if (page) {
                options.page = page;
            } else if (start) {
                options.offset = Number(start);
            }

            const users = await User.paginate({}, options);
            const pagination = {
                recordsTotal: users.total,
                recordsFiltered: users.total,
                draw: Number(draw)
            }
            utils.sendSuccess(res, users, null, pagination);
        } catch (err) {
            utils.sendServerError(res, err);
        }
    }
};
