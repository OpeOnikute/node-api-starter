const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const paginate = require('express-paginate');
const cors = require('cors');

const db = require('./config/db');

const endpoints = require('./endpoints/index');

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressValidator({
    customValidators: {
        isArray: function(value) {
            return Array.isArray(value);
        },
        isText: function (value) {
            return typeof value === 'string';
        },
        inArray: function (value, array) {
            return array.indexOf(value) > -1;
        },
        isObject: function (value) {
            return typeof value === 'object';
        }
    }
}));

app.use('/', endpoints);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500).send({'status': 'error', 'data': err.message});
});

module.exports = app;
