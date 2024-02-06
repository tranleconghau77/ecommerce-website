'use strict';

const Comment = require('../models/comment.model');

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
  }
}

module.exports = new CommentService();
