const utils = require('../lib/utils');
const config = require('../config/config');
const constants = require('../constants/constants');
const responseMessages = require('../constants/responseMessages');
const responseCodes = require('../constants/responseCodes');
const User = require('../models/users');
const jwt = require('jsonwebtoken');

module.exports = {
    
    /**
     * Middleware to verify a user's access before serving the endpoint
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    verifyAccessToken: function(req, res, next){

        const token = req.headers['authorization'] || req.body.token;
        if (!token) {
            return utils.sendError(res, responseMessages.accessDenied, responseCodes.accessDenied, 400);
        }

        jwt.verify(token, config.secret, function (err, decodedToken) {
            if (err) {
                return utils.sendError(res, responseMessages.accessDenied, responseCodes.accessDenied, 400);
            }

        User
            .findOne({ _id: decodedToken._id })
            .lean()
            .exec(function(err, user) {
                if (err) {
                    return utils.sendError(
                        res,
                        responseMessages.internalServerError,
                        responseCodes.internalServerError
                    );
                }

                if (!user) {
                    return utils.sendError(
                        res,
                        responseMessages.userNotFound,
                        responseCodes.userNotFound
                    );
                }

                // token ok, save user onto request object for use in other routes
                req.user = user;
                next();
            });
        });
    },

    /**
     * Middleware to verify a user is an admin.
     * @param req
     * @param res
     * @param next
     */
    isAdmin: function (req, res, next) {

        if (!req.user) {
            utils.sendError(res, responseMessages.accessDenied, responseCodes.accessDenied, 400);
            return;
        }

        const user = req.user;

        if (!user.isAdmin) {
            utils.sendError(res, responseMessages.accessDenied, responseCodes.accessDenied, 400);
            return;
        }

        next();
    },

    /**
     * Middleware to verify a user is an admin.
     * @param req
     * @param res
     * @param next
     */
    isSuperAdmin: function (req, res, next) {

        if (!req.user) {
            utils.sendError(res, responseMessages.accessDenied, responseCodes.accessDenied, 400);
            return;
        }

        const user = req.user;

        if (!user.isAdmin || user.adminRole !== 3) {
            utils.sendError(res, responseMessages.accessDenied, responseCodes.accessDenied, 400);
            return;
        }

        next();
    },

    /**
     * @param res
     * @param modelObj
     * @param saveErrorResponseMessage
     * @param saveErrorResponseCode
     * @param sendError
     * @param sendSuccess
     * @param callback
     */
    saveModelObj: function (res, modelObj, saveErrorResponseMessage, saveErrorResponseCode, sendError, sendSuccess, callback) {
        modelObj.save(function(err, model) {
            if (err) {
                if (sendError) {
                    utils.sendError(res, responseMessages.internalServerError, responseCodes.internalServerError, 500, err);
                    return;
                }

                callback(false);
                return;
            }

            if (!model) {

                if (sendError) {
                    utils.sendError(res, saveErrorResponseMessage, saveErrorResponseCode, 500);
                    return;
                }
    
                callback(false);
                return;
            }

            if (sendSuccess) {
                utils.sendSuccess(res, model);
                return;
            }

            callback(model);
        });
    },

    /**
     * Updates a model's fields dynamically
     * @param res
     * @param params
     * @param modelObj
     * @param skipUpdate
     * @param sendError
     * @param sendSuccess
     */
    updateModelObj: function (res, params, modelObj, skipUpdate, sendError, sendSuccess) {

        if (typeof params !== 'object'){
            utils.sendError(res, responseMessages.internalServerError, responseCodes.internalServerError, 500);
            return;
        }

        for (let key in params) {

            if (!params.hasOwnProperty(key)) continue;

            //make sure the user has that property. hasOwnProperty() does not work for some reason.
            if (typeof modelObj[key] === 'undefined') continue;

            if (skipUpdate.indexOf(key) < 0 ) {
                modelObj[key] = params[key];
            }
        }

        this.saveModelObj(res, modelObj, responseMessages.errorUpdating, responseCodes.errorUpdating, sendError || true, sendSuccess || true);
    }
};
