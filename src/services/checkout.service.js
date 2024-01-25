'use strict';

const { BadRequestError } = require('../core/error.response');
const { findCartById } = require('../models/repository/cart.repo');
const { checkoutProductByServer } = require('../models/repository/product.repo');
const { getDiscountAmount } = require('./discount.service');

class CheckoutService {
  // checkout without login
  /*
        {
            cartId,
            userId,
            shop_order_ids:[
                {
                    shopId,
                    shop_discounts:[
                        "SHOP-1111"
                    ],
                    item_products: {
                        price,
                        quantity,
                        productId,
                    }
                },
                {

                }
            ]
        } 
     */
  static async checkoutReview({ cartId, userId, shop_order_ids }) {
    // check cartId whether exists or not
    const foundCart = await findCartById(cartId);

    if (!foundCart) {
      throw new BadRequestError('Cart does not exist!');
    }

    const checkout_order = {
        totalPrice: 0,
        feeShip: 0,
        totalDiscount: 0,
        totalCheckout: 0,
      },
      shop_order_ids_new = [];

    // total bill
    for (let i = 0; i < shop_order_ids.length; i++) {
      const { shopId, shop_discounts = [], item_products = [] } = shop_order_ids[i];

      //check product available
      const checkProductServer = await checkoutProductByServer(item_products);

      console.log('checkProductServer::', checkProductServer);

      if (!checkProductServer[0]) throw new BadRequestError('Order wrong!!!');

      // total order
      const checkoutPrice = checkProductServer.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      // total money before calculate
      checkout_order.totalCheckout = checkoutPrice;
      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice, // money before discount
        priceApplyDiscount: checkoutPrice,
        item_products: checkProductServer,
      };

      // if shop_discounts exists check whether gt > 0 or not
      if (shop_discounts.length > 0) {
        const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
          codeId: shop_discounts[0].codeId,
          userId,
          shopId,
          products: checkProductServer,
        });

        // total discount
        checkout_order.totalDiscount += discount;
        if (discount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discount;
        }
      }

      checkout_order.totalPrice += itemCheckout.priceRaw;

      shop_order_ids_new.push(itemCheckout);
    }

    checkout_order.totalCheckout = checkout_order.totalPrice - checkout_order.totalDiscount;

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    };
  }

  // order
  static async orderByUser({
    shop_order_ids,
    cartId,
    userId,
    user_address = {},
    user_payment = {},
  }) {
    const { shop_order_ids_new, checkout_order } = await CheckoutService.checkoutReview({
      cartId,
      userId,
      shop_order_ids,
    });

    // check checkout products again whether they exceed the quality of product in the inventory
    // get new array Products
    const products = shop_order_ids_new.flatMap((order) => order.item_products);
    console.log(':::', products);

    for (let i = 0; i < products.length; i++) {
      const { productId, quantity } = products[i];
    }
  }
}

module.exports = CheckoutService;
