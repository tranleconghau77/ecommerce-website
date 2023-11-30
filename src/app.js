const express = require('express');
const { default: helmet } = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { checkOverLoad } = require('./helpers/check.connect');
require('dotenv').config();

const app = express();

// init middlewares
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// init db
require('./dbs/init.mongodb');
// checkOverLoad();

// init router
app.use('', require('./routes/index'));
// handle error

module.exports = app;
