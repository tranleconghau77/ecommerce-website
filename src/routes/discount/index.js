'use strict';

const express = require('express');
const discountController = require('../../controllers/discount.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

// get amount a discount
router.post('/amount', asyncHandler(discountController.getDiscountAmount));
router.get(
  '/list_product_code',
  asyncHandler(discountController.getAllDiscountCodesWithProduct),
);

router.use(authenticationV2);

router.post('', asyncHandler(discountController.createDiscount));
router.post('', asyncHandler(discountController.getAllDiscountCodes));

module.exports = router;
