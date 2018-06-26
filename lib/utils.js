const Constants = require('../constants/constants');

const bcrypt = require('bcryptjs');

const SALT_WORK_FACTOR = 10;

module.exports = {

    /**
     * Sends a response with a success status
     * @param res
     * @param message
     * @param data
     * @param pagination
     */
    sendSuccess: function (res, data, message, pagination) {

        let responseJSON = {
            status: Constants.success
        };

        if (data)
            responseJSON.data = data;

        if (message)
            responseJSON.message = message;

        if (pagination)
            responseJSON.links = pagination;

        res.status(200).send(responseJSON);

        return true;
    },

    /**
     * Sends a json response with an error status
     * @param res
     * @param message
     * @param code
     * @param status_code
     * @param data
     */
    sendError: function (res, message, code, status_code, data) {

        status_code = status_code || 500;

        let responseJSON = {
            status: Constants.error,
            message: message,
            code: code
        };

        if (data)
            responseJSON.data = data;

        res.status(status_code).send(responseJSON);

        return true;
    },

    /**
     * Hash password sent in body params
     */
    hashPassword: function(user, next) {
        // only hash the password if it has been modified (or is new)
        if (!user.isModified('password')) return next();

        // generate a salt
        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
            if (err) return next(err);

            // hash the password along with our new salt
            bcrypt.hash(user.password, salt, function(err, hash){
                if (err) return next(err);

                // override the cleartext password with the hashed one
                user.password = hash;

                next();
            });
        });
    },

    /**
     * Set timestamps - createdAt, updatedAt
     */
    setTimestamps: function(user, next) {
        // get the current date
        let currentDate = new Date();

        // change the updatedAt field to current date
        if (user.createdAt)
            user.updatedAt = currentDate;

        // if createdAt doesn't exist, add this field
        if (!user.createdAt)
            user.createdAt = currentDate;

        next();
    },

    /**
     * Compare hashed password with pass sent in body params
     */
    comparePassword: function(passToTest, cb) {
        bcrypt.compare(passToTest, this.password, function(err, isMatch){
            if (err) return cb(err);
            cb(null, isMatch);
        });
    },

    compareToken: function (token, callback) {
        return callback(token === this.confirmationToken);
    }
};
