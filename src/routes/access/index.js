'use strict';

const express = require('express');
const accessController = require('../../controllers/access.controller');
const { asyncHandlerError } = require('../../auth/checkAuth');
const router = express.Router();

router.post('/shop/signup', asyncHandlerError(accessController.signUp));
router.post('/shop/login', asyncHandlerError(accessController.login));

module.exports = router;
