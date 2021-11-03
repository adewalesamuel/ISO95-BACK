/**
 * Liked post service
 * Author: samueladewale
*/
const mongoose = require('mongoose')
const LikedPost = require('./../models/LikedPost')

/**
 * Gets all the users that liked a post
 * 
 * @param{Object} data the post id
 * @return{Promise}
*/
const getLikedPostUsers = data => {
	return LikedPost.find({
		'post._id': data.postId,
	},{ user: 1 })
}

/**
 * Gets a user liked post
 * 
 * @param{Object} data the user and post id
 * @return{Promise}
*/
const getUserLikedPost = data => {
	return LikedPost.findOne({
		'post._id': data.postId,
		'user._id': data.id
	})
}

/**
 * Gets the ids of a user liked posts
 * 
 * @param{Object} data the user id
 * @param{Object} ids the posts ids
 * @return{Promise}
*/
const getLikedPostsId = (data, ids) => {
	return LikedPost.find({
		'user._id': data.id,
		'post._id': { $in: [...ids] } 
	},{ 'post._id': 1 })
}

/**
 * Gets all of a user liked posts
 * 
 * @param{Object} data the user id
 * @return{Promise}
*/
const getUserLikedPosts = (data) => {
	return LikedPost.find({
		'user._id': data.id,
	},{ post: 1}).limit(23)
}

/**
 * Registers a user liked post
 * 
 * @param{Object} user the user
 * @param{Object} post the post
 * @return{Promise}
*/
const createLikedPost = (user, post) => {
	const likedPost = new LikedPost({
		user: {
			_id: user._id,
			username: user.username,
			profileUrl: user.profileUrl
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

	return likedPost.save()
}

/**
 * Removes a user liked post
 * 
 * @param{Object} data the user and post id
 * @return{Promise}
*/
const removeLikedPost = (data) => {
	return LikedPost.deleteOne({
		'user._id': data.id,
		'post._id': data.postId
	})
}

/**
 * Removes a post from all liked posts
 * 
 * @param{Object} data the post id
 * @return{Promise}
*/
const removeLikedPosts = (data) => {
	return LikedPost.deleteMany({
		'post._id': data.postId
	})
}

/**
 * Updates a user profile url
 *
 * @param{Object} data the user id and the filename of the new picture
 * @return{Promise}
*/
const updateLikedPostProfileUrl = (data) => {
	const profileUrl = `/uploads/profiles/${data.filename}`
	return LikedPost.updateMany(
		{ 'user._id': data.id }, 
		{ $set: {
			'user.profileUrl': profileUrl } })
}

module.exports = {
	getLikedPostsId,
	createLikedPost,
	removeLikedPost,
	removeLikedPosts,
	getUserLikedPost,
	getUserLikedPosts,
	getLikedPostUsers,
	updateLikedPostProfileUrl
}
