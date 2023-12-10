'use strict';

const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const cryto = require('node:crypto');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { BadRequestError } = require('../core/error.response');
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

  // check email
  // match password
  // create accessToken vs refreshToken
  // generate Token
  // get data return login
  static login = async (email, password, refreshToken = null) => {
    const foundShop = await findByEmail(email);
    if (!foundShop) {
      throw new BadRequestError('Shop is not registered');
    }

    const match = bcrypt.compare(password, foundShop.password);
    if (!match) {
    }
  };
}

module.exports = AccessService;
