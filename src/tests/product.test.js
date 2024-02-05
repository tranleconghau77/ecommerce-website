const redisPubSubService = require('../services/redis.PubSub.service');

class ProductServiceTest {
  purchaseProduct(productId, quantity) {
    const order = {
      productId,
      quantity,
    };
    redisPubSubService.publish('purchase_events', JSON.stringify(order));
  }
}

module.exports = new ProductServiceTest();
