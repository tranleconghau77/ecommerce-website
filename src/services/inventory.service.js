'use strict';

const { BadRequestError } = require('../core/error.response');
const inventoryModel = require('../models/inventory.model');
const {} = require('../models/inventory.model');
const { getProductById } = require('../models/repository/product.repo');

class InventoryServices {
  static async addStockToInventory({
    stock,
    productId,
    shopId,
    location = 'Dien Bien Phu, HCM city',
  }) {
    const product = await getProductById(productId);
    if (!product) throw new BadRequestError('The product does not exist!');

    const query = { inven_shopId: shopId, inven_productId: product };
    const updateSet = {
      $inc: {
        inven_stock: stock,
      },
      $set: {
        inven_location: location,
      },
    };
    const options = { upsert: true, new: true };

    return await inventoryModel.findOneAndUpdate({ query, updateSet, options });
  }
}

module.exports = InventoryServices;
