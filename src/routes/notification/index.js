'use strict';

const express = require('express');
const notiController = require('../../controllers/notification.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

router.use(authenticationV2);

router.post('', asyncHandler(notiController.listNotiByUser));

module.exports = router;
