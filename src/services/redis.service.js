'use strict';

const redis = require('redis');
const { promisify } = require('util');
const redisClient = redis.createClient();

const pexpire = promisify(redisClient.pExpire).bind(redisClient);
const setnxAsync = promisify(redisClient.set).bind(redisClient);
