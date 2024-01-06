'use strict';

const express = require('express');
const productController = require('../../controllers/product.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

router.get(
  '/search/:keySearch',
  asyncHandler(productController.getListSearchProduct),
);
router.get('', asyncHandler(productController.findAllProducts));
router.get('/:productId', asyncHandler(productController.findProduct));

router.use(authenticationV2);

router.post('', asyncHandler(productController.createProduct));
router.put('/:productId', asyncHandler(productController.updateProduct));
router.post(
  '/publish/:productId',
  asyncHandler(productController.publishProductByShop),
);
router.post(
  '/unpublish/:productId',
  asyncHandler(productController.unPublishProductByShop),
);

router.get('/drafts/all', asyncHandler(productController.getAllDraftsForShop));
router.get(
  '/published/all',
  asyncHandler(productController.getAllPublishsForShop),
);

module.exports = router;
