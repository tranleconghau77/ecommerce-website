'use strict';

const { NotFoundError } = require('../core/error.response');
const cartModel = require('../models/cart.model');
const { product } = require('../models/product.model');
const { getProductById } = require('../models/repository/product.repo');
const { options } = require('../routes');

/*
    Key features: Cart service
    - add product to cart [USER]
    - reduce product quantity by one [USER]
    - increase product quantity by one [USER]
    - get cart [USER]
    - delete cart [USER]
    - delete cart item [USER]
 */

class CartService {
  static async createUserCart({ userId, product }) {
    const query = { cart_userId: userId, cart_state: 'active' },
      updateOrInsert = {
        $addToSet: {
          cart_products: product,
        },
      },
      option = { upsert: true, new: true };

    return await cartModel.findOneAndUpdate(query, updateOrInsert, option);
  }

  static async updateUserCartQuantity({ userId, product }) {
    const { productId, quantity } = product;
    const query = {
        cart_userId: userId,
        'cart_products.productId': productId,
        cart_state: 'active',
      },
      updateSet = {
        $inc: {
          'cart_products.$.quantity': quantity,
        },
      },
      option = { upsert: true, new: true };

    return await cartModel.findOneAndUpdate(query, updateSet, option);
  }

  static async addToCart({ userId, product = {} }) {
    const userCart = await cartModel.findOne({
      cart_userId: userId,
      'cart_products.productId': product.productId,
    });

    if (!userCart) {
      // create cart for user
      return await CartService.createUserCart({ userId, product });
    }
    // cart is empty
    if (!userCart.cart_products.length) {
      userCart.cart_products = [product];
      return await userCart.save();
    }

    return await CartService.updateUserCartQuantity({ userId, product });
  }

  // update cart
  /* 
    shop_order_ids: [
      {
        shopId:,
        item_products:[
          {
            quantity,
            price,
            shopId,
            old_quantity,
            productId,
          }
        ],
        version,
      }
    ]
   */
  static async addToCartV2({ userId, shop_order_ids = {} }) {
    const { productId, quantity, old_quantity } = shop_order_ids[0]?.item_products[0];

    // check product
    const foundProduct = await getProductById(productId);
    if (!foundProduct) {
      throw new NotFoundError('Product not exist');
    }

    // compare
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
      throw new NotFoundError('Product does not belong in shop');
    }

    if (quantity === 0) {
      // delete
      return await CartService.deleteProductOfCart({ userId, productId });
    }

    return await CartService.updateUserCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity,
      },
    });
  }

  static async deleteProductOfCart({ userId, productId }) {
    const query = { cart_userId: userId, cart_state: 'active' },
      updateSet = {
        $pull: {
          cart_products: { productId },
        },
      };
    const deleteCart = await cartModel.updateOne(query, updateSet);
    return deleteCart;
  }

  static async getListUserCart({ userId }) {
    return await cartModel
      .findOne({
        cart_userId: userId,
      })
      .lean();
  }
}

module.exports = CartService;
