'use strict';

const JWT = require('jsonwebtoken');
const { asyncHandler } = require('../helpers/asyncHandler');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const { findByUserId } = require('../services/keyToken.service');

const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization',
  REFRESH_TOKEN: 'x-rtoken-id',
};

const createTokenPair = async (payload, privateKey, publicKey) => {
  try {
    // accessToken
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: '2 days',
    });

    // accessToken
    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: '7 days',
    });

    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error(`error verify::`, err);
      } else {
        console.log(`decode verify::`, decode);
      }
    });

    return { accessToken, refreshToken };
  } catch (error) {}
};

const authentication = asyncHandler(async (req, res, next) => {
  // 1. Check userId missing???
  // 2. Get accessToken
  // 3. Verify token
  // 4. Check user in db
  // 5. Check keystore with this userId
  // 6. Ok => return next()

  const userId = req.get(HEADER.CLIENT_ID)?.toString();
  if (!userId) throw new AuthFailureError('Invalid Request');

  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError('Not Found Keystore');

  const accessToken = req.get(HEADER.AUTHORIZATION)?.toString();
  if (!accessToken) throw new AuthFailureError('Invalid Request');

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId != decodeUser.userId)
      throw new AuthFailureError('Invalid UserId');
    req.keyStore = keyStore;
    return next();
  } catch (error) {}
});

const authenticationV2 = asyncHandler(async (req, res, next) => {
  // 1. Check userId missing???
  // 2. Get accessToken
  // 3. Verify token
  // 4. Check user in db
  // 5. Check keystore with this userId
  // 6. Ok => return next()

  const userId = req.get(HEADER.CLIENT_ID)?.toString();
  if (!userId) throw new AuthFailureError('Invalid Request');

  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError('Not Found Keystore');

  if (req.get(HEADER.REFRESH_TOKEN)) {
    try {
      const refreshToken = req.get(HEADER.REFRESH_TOKEN);
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
      if (userId != decodeUser.userId)
        throw new AuthFailureError('Invalid UserId');
      req.keyStore = keyStore;
      req.user = decodeUser;
      req.refreshToken = refreshToken;
      return next();
    } catch (error) {}
  }
  const accessToken = req.get(HEADER.AUTHORIZATION)?.toString();
  if (!accessToken) throw new AuthFailureError('Invalid Request');

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId != decodeUser.userId)
      throw new AuthFailureError('Invalid UserId');
    req.keyStore = keyStore;
    return next();
  } catch (error) {}
});

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  authentication,
  verifyJWT,
  authenticationV2,
};
