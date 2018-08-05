const request = require('request');
const async = require('async');

const base_request = request.defaults({
    timeout: 30000,
    followRedirect: true,
    maxRedirects: 10
});

const utils = require('../lib/utils');
const constants = require('../constants/constants');
const responseMessages = require('../constants/responseMessages');
const responseCodes = require('../constants/responseCodes');

const User = require('../models/users');

class BaseHandler {

    constructor (){}

    static getJSON (url, params, callback){
      
        base_request.get({url: url, dataType: 'json'},
            function(err, response){
                if(err){
                    console.log(err);
                    callback(err);
                } else {
                    callback(response);
                }
            });
    }

    /**
     * This is an abstract function used to get any of the models by the ids of one of the documents
     * @param res
     * @param modelObj
     * @param modelId
     * @param populateValues
     * @param sendError
     * @param callback
     * @returns {*}
     */
    static getModelById (res, modelObj, modelId, populateValues, sendError, callback) {

        if (!modelObj.hasOwnProperty('modelName')) {
            if (sendError) {
                const err = 'Invalid model object passed into "getModelById"';
                console.log(err);
                return utils.sendError(res, responseMessages.internalServerError, responseCodes.internalServerError, 500, err);
            }

            callback(false);
        }

        const query = modelObj.findById(modelId);

        //enable population before the query is executed
        if (populateValues) {

            for (var index in populateValues) {
                if(!populateValues.hasOwnProperty(index)) continue;

                const populateValue = populateValues[index];

                query.populate(populateValue);
            }
        }

        query.exec(function(err, model){

            if (err) {

                if(sendError) {
                    return utils.sendError(res, responseMessages.internalServerError, responseCodes.internalServerError, 500, err);
                }

                callback(false);
            }

            if (!model) {

                if(sendError){
                    return utils.sendError(res, responseMessages.paramNotFound(modelObj.modelName), responseCodes.paramNotFound, 404);
                }

                callback(false);
            }

            callback(model);
        });
    }

    /**
     * Generic function to get the count of any matrix.
     * Uses the async parallel callback format.
     * Can also be used to get the length of a model's entries in another model.
     * e.g. Number of departments in a college
     * @param model
     * @param cb - callback function
     * @param query
     */
    static countFn (model, query, cb) {

            query = query || {};

        model
        .count(query, function(err, count){
            if (err) {
                cb(err, null);
                return;
            }

            cb(null, count);
        });
    }

    /**
     * used to get all the entries of a model
     * @param model
     * @param cb
     * @param options
     */
    static getAll (model, cb, options){

        const query = model.find({});

        if (options && options.populate) {
            query.populate(options.populate)
        }

        query.exec(function (err, results) {
            if (err) {
                return cb(err, null);
            }

            cb(null, results);
        });
    }
}

module.exports = BaseHandler;
