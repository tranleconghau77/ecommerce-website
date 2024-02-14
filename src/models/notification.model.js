'use strict';

const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'Notification';
const COLLECTION_NAME = 'Notifications';

const notificationSchema = new Schema(
  {
    noti_type: { type: String, enum: ['order', 'product'] },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  },
);

module.exports = model(DOCUMENT_NAME, notificationSchema);
