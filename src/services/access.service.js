'use strict';

const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const cryto = require('node:crypto');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils');

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN',
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      console.log('AAAAAAA', password);
      //step1: check email exists
      const holderShop = await shopModel.findOne({ email }).lean();
      if (holderShop) {
        return {
          code: 'xxxx',
          message: 'Shop already registered',
        };
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
          return {
            code: 'xxxx',
            message: 'publicKeyString error',
          };
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
    } catch (error) {
      return {
        code: 'xxx',
        message: error.message,
        status: 'error',
      };
    }
  };
}

module.exports = AccessService;
