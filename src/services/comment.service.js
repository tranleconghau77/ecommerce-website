'use strict';

const Comment = require('../models/comment.model');
const { convertToObejctIdMongoDB } = require('../utils');

class CommentService {
  /* 
    key features: Comment service
    + add comment [User, Shop]
    + get a list of comments [User, Shop]
    + delete a comment [User, Shop, Admin]
    */
  static async createComment({ productId, userId, content, parentCommentId = null }) {
    const comment = new Comment({
      comment_productId: productId,
      comment_userId: userId,
      comment_content: content,
      comment_parentId: parentCommentId,
    });

    let rightValue;
    if (parentCommentId) {
      // reply comment
    } else {
      const maxRightValue = await Comment.findOne(
        {
          comment_productId: convertToObejctIdMongoDB(productId),
        },
        'comment_right',
        { sort: { comment_right: -1 } },
      );

      if (maxRightValue) {
        rightValue = maxRightValue.right + 1;
      } else {
      }
    }
  }
}

module.exports = new CommentService();
