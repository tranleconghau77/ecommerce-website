const redisPubSubService = require('../services/redis.PubSub.service');

class InventoryServiceTest {
  constructor() {
    redisPubSubService.subscribe('purchase_events', (channel, message) => {
      InventoryServiceTest.updateInventory(message);
    });
  }

  static updateInventory(message) {
    const { productId, quantity } = JSON.parse(message);
    console.log(`Update inventory ${productId} with quantity ${quantity}`);
  }
}

module.exports = new InventoryServiceTest();
