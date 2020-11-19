const mongoCollections = require('../config/mongoCollections');
const reviews = mongoCollections.reviews;
const verify = require('./verify');

let { ObjectId } = require('mongodb');

module.exports = {
	async getReviewById(reviewId) {
        if (!verify.validString(reviewId)) throw 'reviewId is not a valid string.';

        let parsedId = ObjectId(reviewId);
    
        const reviewCollection = await reviews();
        let review = await reviewCollection.findOne({ _id: parsedId });
        if (review === null) throw 'No review with that id';
        review._id = review._id.toString();
        return review;
    },
    async createReview(reviewerId, restaurantId, reviewText, rating, metrics){
    	const B = (b) => typeof(b)!=='boolean';
    	if (!verify.validString(reviewerId)) throw 'reviewerId is not a valid string.';
        if (!verify.validString(restaurantId)) throw 'restaurantId is not a valid string.';
        if (!verify.validString(reviewText)) throw 'reviewText is not a valid string.';
        if (!verify.validRating(rating)) throw 'rating is not a valid number';
        if (!metrics || typeof(metrcs)!=='object') throw 'metrics is not an object';
        if(B(metrics.distancedTables) || B(metrics.maskedEmployees) || B(metrics.noTouchPayment) || B(metrics.outdoorSeating)){
        	throw 'some fields of metrics are not boolean.'
        }
        let newReview = {
        	reviewerId: reviewerId,
        	restaurantId: restaurantId,
        	reviewText: reviewText,
        	rating: rating,
        	metrics: metrics,
        	comments: [],
        	likes: [],
        	dislikes: []
        };
        const reviewCollection = await reviews();
        const insertInfo = await reviewCollection.insertOne(newReview);
        if (insertInfo.insertedCount === 0) throw 'Could not add review';
    
        const newId = insertInfo.insertedId;
        const finReview = await this.getReviewById(newId.toString());
        return finReview;
    },
    async updateReview(id, newReview){
    	const B = (b) => typeof(b)!=='boolean';
    	let {reviewerId, restaurantId, reviewText, rating, metrics} = newReview;
    	let updater = {}
    	if(verify.validString(reviewerId)){
    		updater.revewerId = revewerId;
    	}else if(reviewerId){
    		throw 'reviewerId is not a valid string.';
    	}
    	if(verify.validString(restaurantId)){
    		updater.restaurantId = restaurantId;
    	}else if(restaurantId){
    		throw 'restaurantId is not a valid string.';
    	}
    	if(verify.validString(reviewText)){
    		updater.reviewText = reviewText;
    	}else if(reviewText){
    		throw 'reviewText is not a valid string.';
    	}
    	if(verify.validRating(rating)){
    		updater.rating = rating;
    	}else if(rating){
    		throw 'rating is not a valid number.';
    	}
    	if(typeof(metrics)==='object'){
    		let { distancedTables, maskedEmployees, noTouchPayment, outdoorSeating } = metrics;
    		if(!(B(distancedTables) || B(maskedEmployees) || B(noTouchPayment) || B(outdoorSeating))){
    			updater.metrics = metrics;
    		}
    	}else if(metrics){
    		throw 'metrics is defined but not a valid object.';
    	}
    	if (!verify.validString(id)) throw 'id is not a valid string.';

    	try{
    		await this.getReviewById(id);
    	}catch(e){
    		throw e;
    	}
    	const updatedInfo = await reviewCollection.updateOne({_id: ObjectId(id)}, {$set: updater});
		if (updatedInfo.modifiedCount === 0) {
	      throw 'Error: the review is not modified (updater format is valid but nothing to update).';
	    }
    	return await this.getReviewById(id);  	
    },
    async updateReviewComment(id, cid, mode = "add"){
    	if (!verify.validString(id)) throw 'id is not a valid string.';
    	if (!verify.validString(cid)) throw 'cid is not a valid string.';
    	try{
	        const oid = ObjectId(id);
	        const pid = ObjectId(cid);
	    }catch(e){
	        throw "Error: id or cid is not a valid ObjectId!"
	    }
	    if(mode == "add"){
	    	const updateInfo = await reviewCollection.updateOne({_id: ObjectId(id)},{$addToSet: {comments: cid}});
		    if (!updateInfo.matchedCount && !updateInfo.modifiedCount) return false;
		    return true;

	    }else{
	    	const updateInfo = await reviewCollection.updateOne({_id: ObjectId(id)},{$pull: {comments: cid}});
		    if (!updateInfo.matchedCount && !updateInfo.modifiedCount) return false;
		    return true;
	    }
    },
    async updateReviewLike(id, cid, mode = "like"){
    	if (!verify.validString(id)) throw 'id is not a valid string.';
    	if (!verify.validString(cid)) throw 'cid is not a valid string.';
    	try{
	        const oid = ObjectId(id);
	        const pid = ObjectId(cid);
	    }catch(e){
	        throw "Error: id or cid is not a valid ObjectId!"
	    }
	    if(mode == "like"){
	    	const updateInfo = await reviewCollection.updateOne({_id: ObjectId(id)},{$addToSet: {likes: cid}});
	    	await reviewCollection.updateOne({_id: ObjectId(id)},{$pull: {dislikes: cid}});
		    if (!updateInfo.matchedCount && !updateInfo.modifiedCount) return false;
		    return true;

	    }else if(mode =="dislike"){
	    	const updateInfo = await reviewCollection.updateOne({_id: ObjectId(id)},{$addToSet: {dislikes: cid}});
	    	await reviewCollection.updateOne({_id: ObjectId(id)},{$pull: {likes: cid}});
		    if (!updateInfo.matchedCount && !updateInfo.modifiedCount) return false;
		    return true;
	    }else{
	    	await reviewCollection.updateOne({_id: ObjectId(id)},{$pull: {likes: cid}});
	    	await reviewCollection.updateOne({_id: ObjectId(id)},{$pull: {dislikes: cid}});
	    	return true;
	    }
    },
    async deleteReview(reviewId){
    	if (!verify.validString(reviewId)) throw 'reviewId is not a valid string.';

        let parsedId = ObjectId(reviewId);
        
        const reviewCollection = await reviews();
        const review = await this.getReviewById(reviewId);
        const deletionInfo = await reviewCollection.deleteOne({ _id: parsedId });
        if (deletionInfo.deletedCount === 0) throw `Could not delete review with id of ${reviewId}`;

        return; 
    }
}