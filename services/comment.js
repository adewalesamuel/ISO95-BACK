/**
 * Comment service
 * Author: samueladewale
*/
const mongoose = require('mongoose')
const Comment = require('./../models/Comment')

/**
 * Deletes a comment
 *
 * @param{Object} data the id of the post 
 * @param{Object} user the user id, username and profilUrl
 * @preturn{Promise}
*/
const createComment = (data, user) => {
	const comment = new Comment({
 		post: {
 			_id: data.postId,
 		},
 		user: {
 			_id: user._id,
 			username: user.username,
 			profileUrl: user.profileUrl
 		},
 		comment: data.comment,
 		time: new Date().getTime(),
	 })

 return comment.save()
}

/**
 * Get the comments of a post
 *
 * @param{Object} data the id of the post 
 * @param{Object} skip the comments to skip
 * @param{Object} limit the comments to limit to
 * @preturn{Promise}
*/
const getPostComments = (data, skip=0, limit=6) => {
	return Comment.find({
		'post._id': data.postId
	})
	.sort({ time: -1 })
	.skip( skip > 0 ? ( (skip - 1) * limit) : 0 )
	.limit(limit)
}

/**
 * Updates the user profil url
 *
 * @param{Object} data the user id
 * @preturn{Promise}
*/
const updateCommentUserProfileUrl = data => {
	const profileUrl = `/uploads/profiles/${data.filename}`
	return Comment.updateMany(
		{ 'user._id': data.id }, 
		{ $set: {
			'user.profileUrl': profileUrl } })
}

/**
 * Deletes a comment
 *
 * @param{Object} data the comment and post id
 * @preturn{Promise}
*/
const deleteComment = data => {
	return Comment.findOneAndDelete({ 
		'post._id': data.postId,
		_id: data.commentId
	})
}

const deletePostComments = data => {
	return Comment.deleteMany({ 
		'post._id': data.postId
	})
}

module.exports = {
	createComment,
	getPostComments,
	updateCommentUserProfileUrl,
	deleteComment,
	deletePostComments
}