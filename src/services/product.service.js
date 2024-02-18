'use strict';

const { BadRequestError } = require('../core/error.response');
const { product, clothing, electronic, furniture } = require('../models/product.model');

const {
  Types: { ObjectId },
} = require('mongoose');

const {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishsForShop,
  unPublishProductByShop,
  searchProductsByUser,
  findAllProducts,
  findProduct,
  updateProductById,
} = require('../models/repository/product.repo');
const { removeUndefinedProp, updateNestedObjectParser } = require('../utils');
const { insertInventory } = require('../models/repository/inventory.repo');
const { pushNotiToSystem } = require('./notification.service');

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
    if (!productClass) throw new BadRequestError(`Invalid Product Type ${type}`);

    return new productClass(payload).createProduct();
  }

  static async updateProduct(type, productId, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) throw new BadRequestError(`Invalid Product Type ${type}`);

    return new productClass(payload).updateProduct(productId);
  }

  // PUT //
  static async publishProductByShop({ product_shop, product_id }) {
    return await publishProductByShop({ product_shop, product_id });
  }

  static async unPublishProductByShop({ product_shop, product_id }) {
    return await unPublishProductByShop({ product_shop, product_id });
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

  static async getListSearchProduct({ keySearch }) {
    return await searchProductsByUser({ keySearch });
  }

  static async findAllProducts({
    limit = 50,
    sort = 'ctime',
    page = 1,
    filter = { isPublished: true },
  }) {
    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: ['product_name', 'product_price', 'product_thumb', 'product_shop'],
    });
  }

  static async findProduct({ product_id }) {
    return await findProduct({ product_id, unSelect: ['__v'] });
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
    const newProduct = await product.create({ ...this, _id: product_id });
    if (newProduct) {
      await insertInventory({
        productId: newProduct._id,
        shopId: this.product_shop,
        stock: this.product_quantity,
      });

      // push noti to system collection
      pushNotiToSystem({
        type: 'SHOP-001',
        receivedId: 1,

        senderId: this.product_shop,
        options: {
          product_name: this.product_name,
          shop_name: this.product_shop,
        },
      })
        .then((rs) => console.log(rs))
        .catch(console.error);
    }
    return newProduct;
  }

  // update product
  async updateProduct(productId, payload) {
    return await updateProductById({
      productId,
      payload,
      model: product,
    });
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

    console.log(444444444444);
    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) throw new BadRequestError('create new Clothing error');

    return newProduct;
  }

  async updateProduct(productId) {
    const objectParams = removeUndefinedProp(this);
    if (objectParams.product_attributes) {
      // update child
      await updateProductById({
        productId,
        payload: updateNestedObjectParser(removeUndefinedProp(objectParams.product_attributes)),
        model: clothing,
      });
    }

    const updateProduct = await super.updateProduct(
      productId,
      updateNestedObjectParser(removeUndefinedProp(objectParams)),
    );
    return updateProduct;
  }
}

class Electronics extends Product {
  async createProduct() {
    const newElectronics = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronics) throw new BadRequestError('create new Electronic error');

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

  async updateProduct() {}
}

// register product type

ProductFactory.registerProductType('Electronics', Electronics);
ProductFactory.registerProductType('Furniture', Furniture);
ProductFactory.registerProductType('Clothing', Clothing);

module.exports = ProductFactory;
