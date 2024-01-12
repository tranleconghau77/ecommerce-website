'use strict';

const ProductService = require('../services/product.service');
const { OK, CREATED, SuccessResponse } = require('../core/success.response');

class ProductController {
  createProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Create new product successfully!',
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  updateProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update product  successfully!',
      metadata: await ProductService.updateProduct(
        req.body.product_type,
        req.params.productId,
        {
          ...req.body,
          product_shop: req.user.userId,
        },
      ),
    }).send(res);
  };

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update product to be published successfully!',
      metadata: await ProductService.publishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.productId,
      }),
    }).send(res);
  };

  unPublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update product to be draft successfully!',
      metadata: await ProductService.unPublishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.productId,
      }),
    }).send(res);
  };

  // QUERY //
  /**
   * @desc Get all Drafts for shop
   * @param {Number} limit
   * @param {Number} skip
   * @return {JSON}
   */

  getAllDraftsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list Drafts successfully!',
      metadata: await ProductService.findAllDraftsForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getAllPublishsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list Publishs successfully!',
      metadata: await ProductService.findAllPublishsForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list products by key search successfully!',
      metadata: await ProductService.getListSearchProduct(req.params),
    }).send(res);
  };

  findAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list products successfully!',
      metadata: await ProductService.findAllProducts(req.query),
    }).send(res);
  };

  findProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get a product successfully!',
      metadata: await ProductService.findProduct({
        product_id: req.params.productId,
      }),
    }).send(res);
  };
}

module.exports = new ProductController();
