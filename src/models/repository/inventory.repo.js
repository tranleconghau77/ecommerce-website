const inventoryModel = require('../inventory.model');

const { Types } = require('mongoose');

const insertInventory = async ({
  productId,
  shopId,
  stock,
  location = 'unKnown',
  reservation,
}) => {
  return await inventoryModel.create({
    inven_productId: productId,
    inven_shopId: new Types.ObjectId(shopId),
    inven_stock: stock,
    inven_location: location,
    inven_reservation: reservation,
  });
};

module.exports = { insertInventory };
