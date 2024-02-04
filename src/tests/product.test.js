const RedisPubSubService = require('../services/redis.PubSub.service');

class ProductServiceTest {
  purchaseProduct(productId, quantity) {
    const order = {
      productId,
      quantity,
    };
  }
}

module.exports = ProductServiceTest;
