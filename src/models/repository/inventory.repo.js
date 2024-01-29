const { convertToObejctIdMongoDB } = require('../../utils');
const inventoryModel = require('../inventory.model');

const { Types } = require('mongoose');

const insertInventory = async ({ productId, shopId, stock, location = 'unKnown', reservation }) => {
  return await inventoryModel.create({
    inven_productId: productId,
    inven_shopId: new Types.ObjectId(shopId),
    inven_stock: stock,
    inven_location: location,
    inven_reservation: reservation,
  });
};

const reservationInventory = async ({ productId, quantity, cartId }) => {
  const query = {
      inven_productId: convertToObejctIdMongoDB(productId),
      inven_stock: { $gte: quantity },
    },
    updateSet = {
      $inc: {
        inven_stock: -quantity,
      },
      $push: {
        inven_reservation: {
          quantity,
          cartId,
          createOn: newDate(),
        },
      },
    },
    options = {
      upsert: true,
      new: true,
    };

  return await inventoryModel.updateOne(query, updateSet, options);
};

module.exports = { insertInventory, reservationInventory };
