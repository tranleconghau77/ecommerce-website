'use strict';

const AccessService = require('../services/access.service');
const { OK, CREATED, SuccessResponse } = require('../core/success.response');
class AccessController {
  handlerRefreshToken = async (req, res, next) => {
    // new SuccessResponse({
    //   message: 'Get Token Successfully!',
    //   metadata: await AccessService.handlerRefreshToken(req.body.refreshToken),
    // }).send(res);

    new SuccessResponse({
      message: 'Get Token Successfully!',
      metadata: await AccessService.handlerRefreshTokenV2({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore,
      }),
    }).send(res);
  };

  logout = async (req, res, next) => {
    new SuccessResponse({
      message: 'Logout Successfully!',
      metadata: await AccessService.logout(req.keyStore),
    }).send(res);
  };

  login = async (req, res, next) => {
    new SuccessResponse({ metadata: await AccessService.login(req.body) }).send(
      res,
    );
  };

  signUp = async (req, res, next) => {
    new CREATED({
      message: ' Registered OK!',
      metadata: await AccessService.signUp(req.body),
      options: { limit: 10 },
    }).send(res);
    // return res.status(201).json(await AccessService.signUp(req.body));
  };
}

module.exports = new AccessController();
