'use strict';

const keyTokenModel = require('../models/keyToken.model');

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey }) => {
    try {
      const tokens = await keyTokenModel.create({
        user: userId,
        privateKey,
        publicKey,
      });

      return tokens ? tokens.publicKey : null;
    } catch (error) {}
  };
}

module.exports = KeyTokenService;
