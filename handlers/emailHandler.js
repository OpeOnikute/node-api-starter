var path = require("path");
var nodemailer = require('nodemailer');

var ejs = require("ejs");
var config = require("../config/config")

var mailgunUser = process.env.MAILGUN_USER;
var mailgunPass = process.env.MAILGUN_PASSWORD;

var transporter = nodemailer.createTransport({
    host: 'smtp.eu.mailgun.org',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: mailgunUser,
        pass: mailgunPass
    }
});

var constants = require('../constants/constants');

var exports = {

    /**
     *
     * @param data
     * @param emailSubject
     * @param context
     * @param uniqueContext
     * @param templateName
     * @param HTMLContent - optional
     * @param adminId
     * @param callback
     */
    sendBulkEmail: function (data, emailSubject, context, uniqueContext, templateName, HTMLContent, adminId, callback) {

        if (!(data instanceof Array)) {
            callback(false);
        }

        var failedLogs = [];
        var successfulLogs = [];

        //created to be able to access the index in the sendEmail callback closure.
        var sendOperation = function (index, receiverObj, context) {

            index += 1;

            exports.sendEmail(receiverObj['email'], emailSubject, context, templateName, HTMLContent, adminId, function (log) {

                if (log.status !== 'success') {
                    failedLogs.push(log);
                } else {
                    successfulLogs.push(log);
                }

                //if it's the last entry, invoke the callback
                if (index === data.length) {
                    callback({
                        sentEmails: successfulLogs,
                        failedEmails: failedLogs
                    });
                }
            });
        };

        //loop through each receiver and send the email
        for (var index in data) {

            if (!data.hasOwnProperty(index)) continue;

            var receiverObj = data[index];

            //add the context specific to the individual receiver
            for (var i in uniqueContext) {

                if (!uniqueContext.hasOwnProperty(i)) continue;

                var contextName = uniqueContext[i];

                context[contextName] = receiverObj[contextName];
            }

            sendOperation(index, receiverObj, context);
        }
    },

    /**
     * @param emailAddress
     * @param emailSubject
     * @param context
     * @param templateName
     * @param content
     * @param adminId
     * @param callback
     */
    sendEmail: function (emailAddress, emailSubject, context, templateName, content, adminId, callback) {

        var emailSchema = {
            to: emailAddress,
            subject: emailSubject,
            status: constants.failed,
            params: context,
            sender: adminId ? 'admin' : 'automatic',
            adminId: adminId || null
        };

        var mainOptions = {
            from: config.emailFrom,
            to: emailAddress,
            subject: emailSubject
        };

        if (templateName) {

            ejs.renderFile(path.join(__dirname, '..', 'lib/email-templates/' + templateName), context, function (err, template) {
                if (err) {
                    //figure out what to do if the email fails. Probably cache and send it later.
                    emailSchema.errorMessage = err;
                    callback(emailSchema);

                } else {

                    emailSchema.template = templateName;

                    mainOptions.html = template;

                    transporter.sendMail(mainOptions, function (err, info) {
                        if (err) {
                            //figure out what to do if the email fails. Probably cache and send it later.
                            emailSchema.errorMessage = err;
                        } else {
                            emailSchema.status = constants.success;
                        }

                        callback(emailSchema);
                    });
                }
            });

        } else {

            //cannot use the same transporter send call because of the async nature
            mainOptions.html = content;

            transporter.sendMail(mainOptions, function (err, info) {
                if (err) {
                    //figure out what to do if the email fails. Probably cache and send it later.
                    emailSchema.errorMessage = err;
                } else {
                    emailSchema.status = constants.success;
                }

                callback(emailSchema);
            });
        }
    }
};

module.exports = exports;