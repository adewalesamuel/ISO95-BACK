/**
 * Liked comment service
 * Author: samueladewale
*/
const mongoose = require('mongoose')
const LikedComment = require('./../models/LikedComment')

/**
 * Gets the ids of a user liked comments
 * 
 * @param{Object} data the user id
 * @param{Object} ids the comments ids
 * @return{Promise}
*/
const getUserLikedComments = (data, ids) => {
	return LikedComment.find({
		'user._id': data.id,
		'comment._id': { $in: [...ids] } 
	},{ 'comment._id': 1 })
}

/**
 * Gets the a user liked comment
 * 
 * @param{Object} data the user and comment id
 * @return{Promise}
*/
const getUserLikedComment = data => {
	return LikedComment.findOne({
		'user._id': data.id,
		'comment._id': data.commentId
	},{ 'comment._id': 1 })
}

/**
 * Registers a user liked comment
 * 
 * @param{Object} data the user and commment id
 * @return{Promise}
*/
const createLikedComment = data => {
	const likedComment = new LikedComment({
		user: { _id: data.id },
		comment: { _id: data.commentId }
	})

	return likedComment.save()
}

/**
 * Removes a user liked comment
 * 
 * @param{Object} data the user and comment id
 * @return{Promise}
*/
const removeUserLikedComment = data => {
	return LikedComment.deleteOne({
		'user._id': data.id,
		'comment._id': data.commentId
	})
}

/**
 * Removes all occurenses of a liked comment
 * 
 * @param{Object} data the comment id
 * @return{Promise}
*/
const removeLikedComment = data => {
	return LikedComment.deleteMany({
		'comment._id': data.commentId
	})
}

module.exports = {
	createLikedComment,
	removeUserLikedComment,
	getUserLikedComments,
	getUserLikedComment,
	removeLikedComment
}
