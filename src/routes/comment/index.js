'use strict';

const express = require('express');
const commentController = require('../../controllers/comment.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

router.use(authenticationV2);

router.post('', asyncHandler(commentController.createComment));

module.exports = router;
