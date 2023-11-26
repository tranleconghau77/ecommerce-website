'use strict';

const dev = {
  app: {
    port: process.env.DEV_APP_PORT || 3052,
  },
  db: {
    host: process.env.DEV_DB_HOST || '127.0.0.1',
    port: process.env.DEV_DB_PORT || 27017,
    name: process.env.DEV_DB_NAME || 'shopDEV',
  },
};

const production = {
  app: {
    port: process.env.PRODUCTION_APP_PORT || 3000,
  },
  db: {
    host: process.env.PRODUCTION_DB_HOST || 'localhost',
    port: process.env.PRODUCTION_DB_PORT || 27017,
    name: process.env.PRODUCTION_DB_NAME || 'shopProduction',
  },
};

const config = { dev, production };
const env = process.env.NODE_ENV || 'dev';

module.exports = config[env];
