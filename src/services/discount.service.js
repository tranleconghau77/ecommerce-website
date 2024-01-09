'use strict';

const { BadRequestError } = require('../core/error.response');
const discountModel = require('../models/discount.model');
const {
  findAllDiscountCodesUnSelect,
} = require('../models/repository/discount.repo');
const { findAllProducts } = require('../models/repository/product.repo');
const { convertToObejctIdMongoDB } = require('../utils');

/*
    Discount Service
    1 - Generator Discount Code [Shop/Admin]
    2 - Get discount amount [User]
    3 - Get all discount codes [User/Shop]
    4 - Verify discount code [User]
    5 - Delete discount code [Shop/Admin]
    6 - Cancel discount code [User]
*/

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      start_date: start_date,
      end_date,
      is_active,
      shopId,
      min_order_value,
      product_ids,
      applies_to,
      name,
      description,
      type,
      value,
      max_value,
      max_uses,
      uses_count,
      users_used,
      max_uses_per_user,
    } = payload;

    if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
      throw new BadRequestError('Discount code has expired!');
    }

    if (new Date(start_date) >= new Date(end_date)) {
      throw new BadRequestError('Start date must be before end day');
    }

    // create index for discount code
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObejctIdMongoDB(shopId),
      })
      .lean();

    if (foundDiscount) {
      throw new BadRequestError('This discount existed');
    }

    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_code: code,
      discount_value: value,
      discount_min_order_value: min_order_value || 0,
      discount_max_value: max_value,
      discount_start_date: new Date(start_date),
      discount_end_date: end_date,
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_users_used: users_used,
      discount_shopId: shopId,
      discount_max_uses_per_user: max_uses_per_user,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to == 'all' ? [] : product_ids,
    });

    return newDiscount;
  }

  static async updateDiscount() {}

  static async getAllProductsByDiscount({ code, shopId, userId, limit, page }) {
    // create index for discount_code
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObejctIdMongoDB(shopId),
      })
      .lean();

    if (!foundDiscount) {
      throw new BadRequestError('This discount does not exist');
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;
    let products;
    if (discount_applies_to == 'all') {
      products = findAllProducts({
        filter: {
          product_shop: convertToObejctIdMongoDB(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name'],
      });
    }

    if (discount_applies_to == 'specific') {
      products = findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name'],
      });
    }

    return products;
  }

  static async getAllDiscountCodesByShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountCodesUnSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObejctIdMongoDB(shopId),
      },
      unSelect: ['__v', 'discount_shopId'],
      model: discountModel,
    });
    return discounts;
  }
}