'use strict';

const DiscountService = require('../services/discount.service');
const { SuccessResponse } = require('../core/success.response');

class DiscountController {
  createDiscount = async (req, res, next) => {
    new SuccessResponse({
      message: 'Generate new discount code successfully!',
      metadata: await DiscountService.createDiscountCode({
        ...req.body,
        shopId: req.user.userId,
      }),
    }).send(res);
  };

  getAllDiscountCodes = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all discount codes by SHOP successfully!',
      metadata: await DiscountService.getAllDiscountCodesByShop({
        ...req.query,
        shopId: req.user.userId,
      }),
    }).send(res);
  };

  getAllDiscountCodesWithProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all discount codes successfully!',
      metadata: await DiscountService.getAllDiscountCodesWithProduct({
        ...req.query,
      }),
    }).send(res);
  };

  getDiscountAmount = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all discount codes successfully!',
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
      }),
    }).send(res);
  };
}

module.exports = new DiscountController();
