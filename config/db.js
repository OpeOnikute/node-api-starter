(function() {

    'use strict';

    const dotenv = require('dotenv').config(); //require env variables to make file independent
    const mongoose = require('mongoose');
    const config = require('./config.js');
    const ENV = process.env.NODE_ENV || 'development';
    const DB_URI = config.db[ENV].url;

    mongoose.connect(DB_URI).catch(function (err) {
        console.error(err.message);
        process.exit(1);
    });

    // connection events
    mongoose.connection.on('connected', function () {
        console.log('Mongoose connected to: ' + DB_URI);
    });

    mongoose.connection.on('error', function (err) {
        console.log('Mongoose connection error: ' + err);
    });

    mongoose.connection.on('disconnected', function () {
        console.log('Mongoose disconnected');
    });

    mongoose.connection.once('open', function (err, data) {
        console.log('Mongo working!');
    });

    // for nodemon restarts
    process.once('SIGUSR2', function () {
        gracefulShutdown('nodemon restart', function () {
            process.kill(process.pid, 'SIGUSR2');
        });
    });

    // for app termination
    process.on('SIGINT', function () {
        gracefulShutdown('app termination', function () {
            process.exit(0);
        });
    });

    // capture app termination / restart events
    // To be called when process is restarted or terminated
    function gracefulShutdown(msg, cb) {
        mongoose.connection.close(function () {
            console.log('Mongoose disconnected through ' + msg);
            cb();
        });
    }
}());