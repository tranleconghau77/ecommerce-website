'use strict';

const { BadRequestError } = require('../core/error.response');
const { product, clothing, electronic } = require('../models/product.model');

// define Factory class to create product
class ProductFactory {
  /*
        type: 'Clothing',
        payload
    */
  static async createProduct(type, payload) {
    switch (type) {
      case 'Electronics':
        return new Electronics(payload);
      case 'Clothing':
        return new Clothing(payload);
      default:
        throw new BadRequestError(`Invalid Product Types ${type}`);
    }
  }
}

/*
    product_name: { type: String, required: true },
    product_thumb: { type: String, required: true },
    product_description: String,
    product_price: { type: Number, required: true },
    product_quantity: { type: Number, required: true },
    product_type: {
      type: String,
      required: true,
      enum: ['Electronics', 'Clothing', 'Furniture'],
    },
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    product_attributes: { type: Schema.Types.Mixed, required: true }, */

// define base Product class
class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
  }

  // create new Product
  async createProduct() {
    return await product.create(this);
  }
}

// Define sub-class for different product types Clothing
class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create(this.product_attributes);
    if (!newClothing) throw new BadRequestError('create new Clothing error');

    const newProduct = await super.createProduct();
    if (!newClothing) throw new BadRequestError('create new Clothing error');

    return newProduct;
  }
}

class Electronics extends Product {
  async createProduct() {
    const newElectronics = await electronic.create(this.product_attributes);
    if (!newElectronics)
      throw new BadRequestError('create new Electronics error');

    const newProduct = await super.createProduct();
    if (!newElectronics)
      throw new BadRequestError('create new Electronics error');

    return newProduct;
  }
}

module.exports = ProductFactory;
