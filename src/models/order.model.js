'use strict';

const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'Order';
const COLLECTION_NAME = 'Orders';

const orderSchema = new Schema(
  {
    order_userid: {
      type: Number,
      required: true,
      order_checkout: { type: Object, default: {} },
      /* 
        order_checkout = {
            totalPrice,
            totalApplyDiscount,
            feeShip
        }
       */
      order_shipping: { type: Object, default: {} },
      /* 
        street,
        city,
        state,
        country
       */
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  },
);

//Export the model
module.exports = model(DOCUMENT_NAME, orderSchema);
