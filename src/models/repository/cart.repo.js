'use strict';

const { convertToObejctIdMongoDB } = require('../../utils');
const cartModel = require('../cart.model');

const findCartById = async (cartId) => {
  return await cartModel
    .findById({ _id: convertToObejctIdMongoDB(cartId), cart_state: 'active' })
    .lean();
};

module.exports = { findCartById };
