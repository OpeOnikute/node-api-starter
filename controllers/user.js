const User = require('../models/users');

const utils = require('../lib/utils');

var responseMessages = require('../constants/responseMessages');
var responseCodes = require('../constants/responseCodes');

module.exports = {

    getAllUsers: (req, res, next) => {
        User.find({})
            .exec()
            .then((users) => {

                if (!users.length) {
                    return utils.sendError(res, responseMessages.noParamFound('user'), responseCodes.noParamFound, 400);
                }

                utils.sendSuccess(res, users);
            })
            .catch((err, num) => {
                return utils.sendError(res, responseMessages.internalServerError, responseCodes.internalServerError, 500, err);
            });
    }
};