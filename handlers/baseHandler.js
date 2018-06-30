var request = require('request');
const async = require('async');

var base_request = request.defaults({
    timeout: 30000,
    followRedirect: true,
    maxRedirects: 10
});

var utils = require('../lib/utils');
var constants = require('../constants/constants');
var responseMessages = require('../constants/responseMessages');
var responseCodes = require('../constants/responseCodes');

var User = require('../models/users');
var Programme = require('../models/programme');
var Department = require('../models/department');

var getStudentsInProgramme = function (programme_id, cb) {
    User
        .count({programme: programme_id, accountType: constants.student})
        .exec(function (err, count) {
            if (err){
                cb(err, null);
            }

            cb(null, count)
        });
};

/**
 * Runs the student count query for multiple programmes in a department and aggregates the result
 * @param department_id
 * @param cb
 */
var getStudentsInDepartment = function (department_id, cb) {
    Programme
        .find({department: department_id}, function (err, programmes) {

            if (err) {
                cb(err, 0);
                return;
            }

            if (programmes.length < 1) {
                cb(null, 0);
                return;
            }

            var countFns = [];

            programmes.map(function (programme) {

                var countfn = function(cb) {
                    getStudentsInProgramme(programme._id, cb);
                };

                countFns.push(countfn);
            });

            async.parallel(countFns, function (err, results) {

                if (results.length < 1) {
                    cb(null, 0);
                    return;
                }

                var students = results.reduce(function (entry, next) {
                    return entry += next;
                });

                cb(null, students);
            });
        });
};

/**
 * Generic function to get the count of any matrix.
 * Uses the async parallel callback format.
 * Can also be used to get the length of a model's entries in another model.
 * e.g. Number of departments in a college
 * @param model
 * @param cb - callback function
 * @param query
 */
var countFn = function(model, query, cb) {

    query = query || {};

    model
        .count(query, function(err, count){
            if (err) {
                cb(err, null);
                return;
            }

            cb(null, count);
        });
};

module.exports = {

    getJSON: function(url, params, callback){
        base_request.get({url: url, dataType: 'json'},
            function(err, response){
                if(err){
                    console.log(err);
                    callback(err);
                } else {
                    callback(response);
                }
            });
    },

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
    getModelById: function (res, modelObj, modelId, populateValues, sendError, callback) {
        
        if (!modelObj.hasOwnProperty('modelName')) {
            if (sendError) {
                var err = 'Invalid model object passed into "getModelById"';
                console.log(err);
                return utils.sendError(res, responseMessages.internalServerError, responseCodes.internalServerError, 500, err);
            }
            
            callback(false);
        }
        
        var query = modelObj.findById(modelId);

        //enable population before the query is executed
        if (populateValues) {

            for (var index in populateValues) {
                if(!populateValues.hasOwnProperty(index)) continue;

                var populateValue = populateValues[index];

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
    },

    /**
     * Generic function to get the count of any matrix.
     * Uses the async parallel callback format.
     * Can also be used to get the length of a model's entries in another model.
     * e.g. Number of departments in a college
     * @param model
     * @param cb - callback function
     * @param query
     */
    countFn: countFn,

    /**
     * used to get all the entries of a model
     * @param model
     * @param cb
     * @param options
     */
    getAll: function(model, cb, options){

        var query = model.find({});

        if (options && options.populate) {
            query.populate(options.populate)
        }

        query.exec(function (err, results) {
            if (err) {
                return cb(err, null);
            }

            cb(null, results);
        });
    },

    /**
     * @param college_id
     * @param cb
     */
    getStudentsInCollege: function (college_id, cb) {
        Department
            .find({college: college_id}, function (err, departments) {
                if (err) {
                    cb(err, null);
                    return;
                }

                if (departments.length < 1) {
                    cb(null, 0);
                    return;
                }

                //run the queries in parallel to save time
                var countFns = [];

                departments.map(function (department) {

                    var countfn = function(cb) {
                        getStudentsInDepartment(department._id, cb);
                    };

                    countFns.push(countfn);
                });

                async.parallel(countFns, function (err, results) {

                    if (results.length < 1) {
                        cb(null, 0);
                        return;
                    }

                    var students = results.reduce(function (entry, next) {
                        return entry += next;
                    });

                    cb(null, students);
                });
            });
    },

    /**
     * @param college_id
     * @param cb
     */
    getProgrammesInCollege: function (college_id, cb) {
        Department
            .find({college: college_id}, function (err, departments) {
                if (err) {
                    cb(err, null);
                    return;
                }

                if (departments.length < 1) {
                    cb(null, 0);
                    return;
                }

                //run the queries in parallel to save time
                var countFns = [];

                departments.map(function (department) {

                    var countfn = function(cb) {
                        countFn(Programme, {department: department._id}, cb);
                    };

                    countFns.push(countfn);
                });

                async.parallel(countFns, function (err, results) {

                    if (results.length < 1) {
                        cb(null, 0);
                        return;
                    }

                    var programmes = results.reduce(function (entry, next) {
                        return entry += next;
                    });

                    cb(null, programmes);
                });
            });
    },

    getStudentsInDepartment: getStudentsInDepartment,

    getStudentsInProgramme: getStudentsInProgramme
};