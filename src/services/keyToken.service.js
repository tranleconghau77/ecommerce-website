'use strict';

const keyTokenModel = require('../models/keyToken.model');
const {
  Types: { ObjectId },
} = require('mongoose');

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    try {
      // level 0
      // const tokens = await keyTokenModel.create({
      //   user: userId,
      //   privateKey,
      //   publicKey,
      // });
      // return tokens ? tokens.publicKey : null;

      // level xxxx
      const filter = { user: userId },
        update = {
          publicKey,
          privateKey,
          refreshTokenUsed: [],
          refreshToken,
        },
        options = {
          upsert: true,
          new: true,
        };
      const tokens = await keyTokenModel.findOneAndUpdate(
        filter,
        update,
        options,
      );

      return tokens ? tokens.publicKey : null;
    } catch (error) {}
  };

  static findByUserId = async (userId) => {
    return await keyTokenModel.findOne({ user: new ObjectId(userId) }).lean();
  };

  static removeKeyById = async (id) => {
    return await keyTokenModel.deleteOne(id);
  };
}

module.exports = KeyTokenService;
