const User = require('../models/users');
const utils = require('../lib/utils');
const responseMessages = require('../constants/responseMessages');
const responseCodes = require('../constants/responseCodes');
const constants = require('../constants/constants');

module.exports = {

    /**
     * @param res
     * @param userId
     * @param sendError
     * @param options
     * @param callback
     */
    getUserById: function (res, userId, sendError, callback, options) {

        User.findById(userId, '-password')
            .populate('programme')
            .lean(options ? (options.lean ||false) : false)
            .exec()
            .then(user => {

                if (!user) {

                    if (sendError) {
                        utils.sendError(res, responseMessages.paramNotFound('user'), responseCodes.paramNotFound, 404);
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
                        utils.sendError(res, responseMessages.internalServerError, responseCodes.internalServerError, 500, err);
                        return;
                    }

                    callback(false);
                }
            });
    },

    /**
     * @param res
     * @param email
     * @param callback
     * @param options
     */
    getUserByEmail: function (res, email, callback, options) {

        User.findOne({'email': email})
            .populate('programme')
            .lean(options ? (options.lean ||false) : false)
            .exec()
            .then(user => {
                if (!user) {
                    return callback(null, null);
                }
                callback(null, user);
            }).catch(err => {
                callback(err, null);
            });
    }
};