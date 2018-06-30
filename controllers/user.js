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

        req.sanitizeBody();

        // req params validation for required fields
        req.checkBody('email', '%0 is not a valid email address').isEmail();
        req.checkBody('image', '%0 isn\'t a valid image location').optional().isText();
        req.checkBody('password', 'Password must be defined').notEmpty();

        // validate user input
        req
            .getValidationResult()
            .then(result => {

                if (!result.isEmpty()) {
                    return utils.sendError(res, responseMessages.invalidParams, responseCodes.invalidParams, 400, result.array());
                }

                //Check if a user with that email already exists
                userHandler.getUserByEmail(res, params.email, function(existingUser){

                    if (existingUser) {
                        utils.sendError(res,responseMessages.paramAlreadyExists('user', 'name'), responseCodes.paramAlreadyExists, 400);
                        return;
                    }

                    const user = new User({
                        firstName: params.firstName,
                        lastName: params.lastName,
                        password: params.password,
                        email: params.email
                    });

                    baseController.saveModelObj(res, user, responseMessages.paramsNotCreated('user'),
                        responseCodes.paramsNotCreated, true, true);
                });
            });
    },

    getAllUsers: (req, res) => {
        User.find({})
            .exec()
            .then((users) => {

                if (!users.length) {
                    return utils.sendError(res, responseMessages.noParamFound('user'), responseCodes.noParamFound, 400);
                }

                utils.sendSuccess(res, users);
            })
            .catch((err) => {
                return utils.sendError(res, responseMessages.internalServerError, responseCodes.internalServerError, 500, err);
            });
    },

    /**
     * Endpoint to update a user's details
     * @param req
     * @param res
     */
    updateUser: (req, res)  => {

        const userId = req.user._id;

        const skipUpdate = ['status', 'createdAt', 'updatedAt'];

        userHandler.getUserById(res, userId, true, (user) => {

            if (!user) {
                return;
            }

            baseController.updateModelObj(res, req.body, user, skipUpdate, true, true);
        });
    },

    /**
     * Endpoint to get a user's details by id
     * @param req
     * @param res
     */
    getUserById: (req, res) => {

        const userId = req.params.userId;

        req.checkBody('userId', '%0 isn\'t a valid ID').isMongoId();

        req
            .getValidationResult()
            .then(result => {

                if (!result.isEmpty()) {
                    return utils.sendError(res, responseMessages.invalidParams, responseCodes.invalidParams, 400, result.array());
                }

                userHandler.getUserById(res, userId, true, function (user) {

                    if (!user) return;

                    utils.sendSuccess(res, user);
                });
            });
    }
};