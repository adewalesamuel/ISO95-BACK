/**
 * Viewed post service
 * Author: samueladewale
*/
const mongoose = require('mongoose')
const PostView = require('./../models/PostView')

/**
 * Gets a user post views
 *
 * @param{Object} data the user id
 * @return{Promise}
*/
const getUserPostViews = data => {
	return PostView.find({
		'user._id': data.id
	}, { post: 1}).limit(23)
}

/**
 * Gets a user post views
 *
 * @param{Object} data the user id
 * @return{Promise}
*/
const getUserPostView = (user,post) => {
	return PostView.findOne({
		'user._id': user._id,
		'post._id': post._id
	})
}


/**
 * Registers a user post view
 *
 * @param{Object} user the user
 * @param{Object} post the post
 * @return{Promise}
*/
const createPostView = (user, post) => {
	const postView = new PostView({
		user: {
			_id: user._id,
			username: user.username,
			profilUrl: user.profileUrl
		},
		post: {
			_id: post._id,
			photo: {
				alt: post.photo.alt,
			},
			place: {
				city: post.place.city,
				country: post.place.country
			},
			tags: [...post.tags]
		}
	})

	return postView.save()
}

/**
 * Updates a users profile url
 *
 * @param{Object} data the user id and filename of the picture
 * @return{Promise}
*/
const updatePostViewProfileUrl = data => {
	const profileUrl = `/uploads/profiles/${data.filename}`
	return PostView.updateMany(
		{ 'user._id': data.id }, 
		{ $set: {
			'user.profileUrl': profileUrl } })
}

/**
 * Removes a post from all post views
 * 
 * @param{Object} data the post id
 * @return{Promise}
*/
const removePostViews = data => {
	return PostView.deleteMany({
		'post._id': data.postId
	})
}

module.exports = {
	createPostView,
	getUserPostViews,
	updatePostViewProfileUrl,
	removePostViews,
	getUserPostView
}
