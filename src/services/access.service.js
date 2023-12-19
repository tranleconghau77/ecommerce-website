'use strict';

const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const cryto = require('node:crypto');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair, verifyJWT } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require('../core/error.response');
const { findByEmail } = require('./shop.service');
const { keys } = require('lodash');

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN',
};

class AccessService {
  // 1. check tokenUsed
  static handlerRefreshToken = async (refreshToken) => {
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(
      refreshToken,
    );
    if (foundToken) {
      // decode
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey,
      );
      console.log({ userId, email });

      // delete all tokens
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError('Something wrong happened! Please relogin');
    }

    // not found
    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
    if (!holderToken) throw new AuthFailureError('Shop is not registered!');

    // verifyToken
    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey,
    );
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new AuthFailureError('Shop is not registered!');

    // create new token pair
    const tokens = await createTokenPair(
      { userId, email },
      holderToken.privateKey,
      holderToken.publicKey,
    );

    // update toekn
    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken,
      },
    });

    return {
      user: { userId, email },
      tokens,
    };
  };

  static handlerRefreshTokenV2 = async ({ refreshToken, user, keyStore }) => {
    const { userId, email } = user;

    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError('Something wrong happened! Please relogin');
    }

    if (keyStore.refreshToken !== refreshToken)
      throw new AuthFailureError('Shop is not registered!');

    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new AuthFailureError('Shop is not registered!');

    // create new token pair
    const tokens = await createTokenPair(
      { userId, email },
      keyStore.privateKey,
      keyStore.publicKey,
    );

    // update toekn
    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken,
      },
    });

    return {
      user,
      tokens,
    };
  };

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
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    console.log({ delKey });
    return delKey;
  };
}

module.exports = AccessService;
