'use strict';

const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const cryto = require('node:crypto');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { BadRequestError, AuthFailureError } = require('../core/error.response');
const { findByEmail } = require('./shop.service');

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN',
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    //step1: check email exists
    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) {
      throw new BadRequestError('Error: Shop already registered');
    }

    // add new shop
    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      // const { privateKey, publicKey } = cryto.generateKeyPairSync('rsa', {
      //   modulusLength: 4096,
      //   publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
      //   privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
      // });
      const privateKey = cryto.randomBytes(64).toString('hex');
      const publicKey = cryto.randomBytes(64).toString('hex');

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        privateKey,
        publicKey,
      });

      if (!keyStore) {
        throw new BadRequestError('Error: create publicKeyString error');
      }

      // created token pair
      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        privateKey,
        publicKey,
      );
      console.log(`Create Token Success::`, tokens);

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fields: ['_id', 'name', 'email'],
            object: newShop,
          }),
          tokens,
        },
      };
    }
    return {
      code: 200,
      metadata: null,
    };
  };

  // 1.check email
  // 2.match password
  // 3.create accessToken vs refreshToken
  // 4.generate Token
  // 5.get data return login
  static login = async ({ email, password, refreshToken = null }) => {
    // 1.
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError('Shop is not registered');
    }

    // 2.
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) {
      throw new AuthFailureError('Authentication error');
    }

    // 3.
    const privateKey = cryto.randomBytes(64).toString('hex');
    const publicKey = cryto.randomBytes(64).toString('hex');

    // 4.
    const tokens = await createTokenPair(
      { userId: foundShop._id, email },
      privateKey,
      publicKey,
    );

    await KeyTokenService.createKeyToken({
      userId: foundShop._id,
      refreshToken: tokens.refreshToken,
      publicKey,
      privateKey,
    });

    return {
      metadata: {
        shop: getInfoData({
          fields: ['_id', 'name', 'email'],
          object: foundShop,
        }),
        tokens,
      },
    };
  };

  static logout = async (keyStore) => {
    console.log(22222222, keyStore);
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    console.log({ delKey });
    return delKey;
  };
}

module.exports = AccessService;
