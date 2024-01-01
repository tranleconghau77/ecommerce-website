'use strict';

const { BadRequestError } = require('../core/error.response');
const {
  product,
  clothing,
  electronic,
  furniture,
} = require('../models/product.model');

const {
  Types: { ObjectId },
} = require('mongoose');

const {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishsForShop,
} = require('../models/repository/product.repo');

// define Factory class to create product
class ProductFactory {
  /*
        type: 'Clothing',
        payload
    */

  static productRegistry = {}; // key-class

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProduct(type, payload) {
    // switch (type) {
    //   case 'Electronics':
    //     return new Electronics(payload).createProduct();
    //   case 'Clothing':
    //     return new Clothing(payload).createProduct();
    //   case 'Furniture':
    //     return new Furniture(payload).createProduct();
    //   default:
    //     throw new BadRequestError(`Invalid Product Types ${type}`);
    // }

    const productClass = ProductFactory.productRegistry[type];
    if (!productClass)
      throw new BadRequestError(`Invalid Product Type ${type}`);

    return new productClass(payload).createProduct();
  }

  // PUT //
  static async publishProductByShop({ product_shop, product_id }) {
    return await publishProductByShop({ product_shop, product_id });
  }

  // QUERY //
  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };
    return await findAllDraftsForShop(query, limit, skip);
  }

  static async findAllPublishsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true };
    return await findAllPublishsForShop(query, limit, skip);
  }
}

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
  async createProduct(product_id) {
    this.product_shop = new ObjectId(this.product_shop);
    return await product.create({ ...this, _id: product_id });
  }
}

// Define sub-class for different product types Clothing
class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothing) throw new BadRequestError('create new Clothing error');

    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) throw new BadRequestError('create new Clothing error');

    return newProduct;
  }
}

class Electronics extends Product {
  async createProduct() {
    const newElectronics = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronics)
      throw new BadRequestError('create new Electronic error');

    const newProduct = await super.createProduct(newElectronics._id);
    if (!newProduct) throw new BadRequestError('create new Electronic error');

    return newProduct;
  }
}

class Furniture extends Product {
  async createProduct() {
    const newFurniture = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newFurniture) throw new BadRequestError('create new Furniture error');

    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) throw new BadRequestError('create new Furniture error');

    return newProduct;
  }
}

// register product type

ProductFactory.registerProductType('Electronics', Electronics);
ProductFactory.registerProductType('Furniture', Furniture);
ProductFactory.registerProductType('Clothing', Clothing);

module.exports = ProductFactory;