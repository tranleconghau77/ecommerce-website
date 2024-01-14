'use strict';

const cartModel = require('../models/cart.model');
const { product } = require('../models/product.model');
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
    const userCart = await cartModel.findOne({ cart_userId: userId });

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
}

module.exports = CartService;
