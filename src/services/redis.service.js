'use strict';

const redis = require('redis');
const { promisify } = require('util');
const { reservationInventory } = require('../models/repository/inventory.repo');
const redisClient = redis.createClient();

const pexpire = promisify(redisClient.pExpire).bind(redisClient);
const setnxAsync = promisify(redisClient.set).bind(redisClient);

const acquiredLock = async (productId, quantity, cartId) => {
  const key = `lock_v2024_${productId}`;
  const retryTimes = 10;
  const expireTime = 3000;

  for (let i = 0; i < retryTimes.length; i++) {
    const result = await setnxAsync(key, expireTime); // check key if exist return 0 else return 1
    console.log(`result:::`, result);

    if (result == 1) {
      // work with inventory
      const isResersation = await reservationInventory({
        productId,
        quantity,
        cartId,
      });

      if (isResersation.modifiedCount) {
        await pexpire(key, expireTime);
        return key;
      }

      return null;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
};

const releaseLock = async (keyLock) => {
  const delAsyncKey = promisify(redisClient.del).bind(redisClient);
  return await delAsyncKey(keyLock);
};

module.exports = {
  acquiredLock,
  releaseLock,
};
