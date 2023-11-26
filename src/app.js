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

// init db
require('./dbs/init.mongodb');
checkOverLoad();

// init router
app.get('/', (req, res, next) => {
  return res.status(200).json({ message: 'Welcome Ecommerce Server' });
});

// handle error

module.exports = app;
