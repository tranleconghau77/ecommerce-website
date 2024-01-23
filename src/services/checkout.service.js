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
        feeShoip: 0,
        totalDiscount: 0,
        totalCheckout: 0,
      },
      shop_order_ids_new = [];

    // total bill
    for (let index = 0; index < shop_order_ids.length; index++) {
      const { shopId, shop_discounts = [], item_products = [] } = shop_order_ids[i];

      //check product available
      const checkProductServer = await checkoutProductByServer(item_products);

      console.log('checkProductServer::', checkProductServer);

      if (!checkProductServer[0]) throw new BadRequestError('Order wrong!!!');

      // total order
      const checkoutPrice = checkoutProductByServer.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      // total money before calculate
      checkout_order.totalCheckout = checkoutPrice;
      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice, // money before discount
        priceApplyDiscount: checkoutPrice,
        item_products: checkoutProductByServer,
      };

      // if shop_discounts exists check whether gt > 0 or not
      if (shop_discounts.length > 0) {
        const { totalPrice = 0, totalDiscount = 0 } = await getDiscountAmount({
          codeId: shop_discounts[0].codeId,
          userId,
          shopId,
          products: checkProductServer,
        });

        // total discount
        checkout_order.totalDiscount = totalDiscount;
        if (totalDiscount > 0) {
          itemCheckout.priceApplyDiscount = checkProductServer - totalDiscount;
        }
      }

      checkout_order.totalCheckout = itemCheckout.priceApplyDiscount;
      shop_order_ids_new.push(itemCheckout);
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    };
  }
}

module.exports = CheckoutService;