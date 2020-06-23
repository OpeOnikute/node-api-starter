var path = require("path");
var nodemailer = require('nodemailer');

var ejs = require("ejs");

var mailgunUser = process.env.MAILGUN_USER;
var mailgunPass = process.env.MAILGUN_PASSWORD;

var transporter = nodemailer.createTransport({
    service: 'Mailgun',
    auth: {
        user: mailgunUser,
        pass: mailgunPass
    }
});

var utils = require('../lib/utils');
var constants = require('../constants/constants');
var responseMessages = require('../constants/responseMessages');
var responseCodes = require('../constants/responseCodes');
var EmailLog = require('../models/emailLog');

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

        var emailSchema = new EmailLog({
            to: emailAddress,
            subject: emailSubject,
            status: constants.failed,
            params: context,
            sender: adminId ? 'admin' : 'automatic',
            adminId: adminId || null
        });

        var mainOptions = {
            from: '"The 13th Set" cudevelopers@gmail.com',
            to: emailAddress,
            subject: emailSubject
        };

        if (templateName) {

            ejs.renderFile(path.join(__dirname, '..', 'lib/email-templates/' + templateName), context, function (err, template) {
                if (err) {
                    //figure out what to do if the email fails. Probably cache and send it later.
                    emailSchema.errorMessage = err;

                    emailSchema.save(function (err) {
                        if(err) {
                            console.log(err);
                        }
                    });

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

                        emailSchema.save(function (err) {
                            if(err) {
                                console.log(err);
                            }
                        });

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

                emailSchema.save(function (err) {
                    if(err) {
                        console.log(err);
                    }
                });

                callback(emailSchema);
            });
        }
    },

    /**
     *
     * @param res
     * @param sender
     * @param adminId
     * @param options
     */
    getSentEmails:  function (res, sender, adminId, options) {

        var params = {};

        if (sender){
            params.sender = sender === constants.admin ? sender : constants.automatic;
            if (sender === constants.admin && adminId !== false) {
                params.adminId = adminId;
            }
        }

        //get the specific admin's emails

        EmailLog.paginate(params, options, function (err, emails) {

            if (err) {
                utils.sendError(res, responseMessages.internalServerError, responseCodes.internalServerError, 500, err);
                return;
            }

            if (!emails) {
                utils.sendError(res, responseMessages.noParamFound(constants.emailPlural), responseCodes.noParamFound, 404);
                return;
            }

            var pagination = {
                pageNumber: emails.page,
                itemsPerPage: emails.limit,
                prev: res.locals.paginate.href(true),
                next: res.locals.paginate.href()
            };

            utils.sendSuccess(res, emails, false, pagination);
        });
    }
};

module.exports = exports;