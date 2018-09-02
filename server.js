'use strict';

require('dotenv').config();
const config = require('./config/config');
const restify = require('restify');
const versioning = require('restify-url-semver');
const joi = require('joi');

// Require DI
const serviceLocator = require('./config/di');
const validator = require('./lib/validator');
const handler = require('./lib/error_handler');
const routes = require('./routes/routes');
const logger = serviceLocator.get('logger');
const server = restify.createServer({
  name: config.app.name,
  versions: ['1.0.0'],
  formatters: {
    'application/json': require('./lib/jsend')
  }
});

// Initialize the database
const Database = require('./config/db');
new Database(config.mongo.port, config.mongo.host, config.mongo.name);

// Set API versioning and allow trailing slashes
server.pre(restify.pre.sanitizePath());
server.pre(versioning({ prefix: '/' }));

// Set request handling and parsing
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(
  restify.plugins.bodyParser({
    mapParams: false
  })
);

// initialize validator for all requests
server.use(validator.paramValidation(logger, joi));

// Setup Error Event Handling
handler.register(server);

// Setup route Handling
routes.register(server, serviceLocator);

// start server
server.listen(config.app.port, () => {
  console.log(`${config.app.name} Server is running on port - 
    ${config.app.port}`);
});
