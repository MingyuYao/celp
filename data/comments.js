const mongoCollections = require('../config/mongoCollections');
const comments = mongoCollections.comments;
const verify = require('./verify');
const reviews = require('./reviews');

let { ObjectId } = require('mongodb');

module.exports = {
    async getCommentById(commentId) {
        if (!verify.validString(commentId)) throw 'commentId is not a valid string.';

        let parsedId = ObjectId(commentId);
    
        const commentCollection = await comments();
        let comment = await commentCollection.findOne({ _id: parsedId });
        if (comment === null) throw 'No comment with that id';
        comment._id = comment._id.toString();

        return comment;
    },

    async createComment(reviewId, userId, text) {
        if (!verify.validString(reviewId)) throw 'reviewId is not a valid string.';
        if (!verify.validString(userId))   throw 'userId is not a valid string.';
        if (!verify.validString(text))     throw 'text is not a valid string.';
        
        /* Add new comment to DB */
        let newComment = {reviewId: reviewId, userId: userId, text: text};
        const commentCollection = await comments();
        const insertInfo = await commentCollection.insertOne(newComment);
        if (insertInfo.insertedCount === 0) throw 'Could not add comment';
    
        const newId = insertInfo.insertedId;
        const finComment = await this.getCommentById(newId.toString());

        /* Add comment Id to respective review */
        const addtoReview = await reviews.updateReviewComment(reviewId, newId.toString(), "add");
        if(!addtoReview) throw 'Comment is not added in review: '+reviewId;

        /* Add comment Id to respective user 
        const user = await users.getUserById(userId);
        let userArray = user.comments;
        userArray.push(newId.toString());
        await users.updateUser(userId, undefined, undefined, undefined, undefined, undefined,
                undefined, undefined, undefined, userArray);*/

        return finComment;
    },

    async deleteComment(commentId) {
        if (!verify.validString(commentId)) throw 'commentId is not a valid string.';

        let parsedId = ObjectId(commentId);
        
        const commentCollection = await comments();
        const comment = await this.getCommentById(commentId);

        /* Remove comment Id from respective review */
        const delfromReview = await reviews.updateReviewComment(reviewId, newId.toString(), "delete");
        if(!delfromReview) throw 'Comment is not deleted in review: '+reviewId;
    
        /* Remove comment Id from respective user 
        const user = await users.getUserById(comment.userId);
        let userArray = user.comments;
        let userIndex = userArray.indexOf(commentId);
        if (userIndex > -1) userArray.splice(userIndex, 1);
        await users.updateUser(comment.userId, undefined, undefined, undefined, undefined,
                undefined, undefined, undefined, undefined, userArray); */

        /* delete comment from DB */
        const deletionInfo = await commentCollection.deleteOne({ _id: parsedId });
        if (deletionInfo.deletedCount === 0) throw `Could not delete comment with id of ${commentId}`;

        return; 
    },

    async getAllCommentsOfUser(userId) {
        if (!verify.validString(userId)) throw 'userId is not a valid string.';

        const commentCollection = await comments();
        const commentList = await commentCollection.find({'userId': { $eq: userId}}).toArray();
        for (let x of commentList) {
            x._id = x._id.toString();
        }

        return commentList;
    },

    async getAllCommentsOfReview(reviewId) {
        if (!verify.validString(reviewId)) throw 'reviewId is not a valid string.';
        
        const commentCollection = await comments();
        const commentList = await commentCollection.find({'reviewId': { $eq: reviewId}}).toArray();
        for (let x of commentList) {
            x._id = x._id.toString();
        }

        return commentList;
    },

}


const users = require('./users');