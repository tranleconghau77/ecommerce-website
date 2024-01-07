'use strict';

const { Schema, model } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Inventory';
const COLLECTION_NAME = 'Inventories';

// Declare the Schema of the Mongo model
var inventorySchema = new Schema(
  {
    inven_productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    inven_location: { type: String, default: 'unKnown' },
    inven_stock: { type: Number, require: true },
    inven_shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },

    /*
        cartId, stock, createOn
     */
    inven_reservation: { type: Array, default: [] },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  },
);

//Export the model
module.exports = model(DOCUMENT_NAME, inventorySchema);
