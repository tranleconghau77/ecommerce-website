'use strict';

const { Schema, model } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Discount';
const COLLECTION_NAME = 'Discounts';

// Declare the Schema of the Mongo model
var discountSchema = new Schema(
  {
    discount_name: { type: String, required: true },
    discount_description: { type: String, required: true },
    discount_type: { type: String, default: 'fixed_amount' }, // percentage,
    discount_value: { type: Number, required: true }, // 10.000, 10
    discount_code: { type: String, required: true },
    discount_start_date: { type: Date, required: true },
    discount_start_end: { type: Date, required: true },
    discount_max_uses: { type: Number, required: true }, // maximum discounts
    discount_uses_count: { type: Number, required: true }, // number of discounts is used
    discount_users_used: { type: Array, default: [] }, // who uses discount
    discount_max_uses_per_user: { type: Number, required: true }, // number of maximum discounts per user
    discount_min_order_value: { type: Number, required: true }, // min value of order
    discount_shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
    discount_is_active: { type: Boolean, default: true },
    discount_applies_to: {
      type: String,
      required: true,
      enum: ['all', 'specific'],
    },
    discount_product_ids: { type: Array, default: [] }, // list of products is applied for
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  },
);

//Export the model
module.exports = model(DOCUMENT_NAME, discountSchema);
