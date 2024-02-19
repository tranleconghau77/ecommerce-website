'use strict';

const { SuccessResponse } = require('../core/success.response');
const NotiService = require('../services/notification.service');

class NotiController {
  listNotiByUser = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list of notifications successfully!',
      metadata: await NotiService.listNotiByUser(req.body),
    }).send(res);
  };
}

module.exports = new NotiController();
