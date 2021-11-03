/**
 * Favorite post service
 * Author: samueladewale
*/
const mongoose = require('mongoose')
const FavoritePost = require('./../models/FavoritePost')

/**
 * Gets a user favorite post
 * 
 * @param{Object} data the the user and post id
 * @return{Promise}
*/
const getUserFavoritePost = data => {
	return FavoritePost.findOne({
		'post._id': data.postId,
		'user._id': data.id
	})
}

/**
 * Gets all favorite posts of a user
 * 
 * @param{Object} data the user id
 * @return{Promise}
*/
const getFavoritePosts = data => {
	return FavoritePost.find({
		'user._id': data.id,
	},{ 'post': 1 }).limit(23)
}

/**
 * Gets all favorite posts ids of a user
 * 
 * @param{Object} data the user id
 * @param{Object} data the ids of the post
 * @return{Promise}
*/
const getAllFavoritePostsWithIds = (data, ids) => {
	return FavoritePost.find({
		'user._id': data.id,
		'post._id': { $in: [...ids] }
	},{ 'post': 1 })
}

/**
 * Gets all a users favorite posts id
 * 
 * @param{Object} data the user username
 * @params{Number} skip the posts to skip
 * @params{Number} limit the posts limit
 * @return{Promise}
*/
const getUserFavoritePostsId = (data, skip=0, limit=6) => {
	return FavoritePost.find({
		'user.username': data.username,
	},{ 'post._id': 1 })
	.skip( skip > 0 ? ( (skip - 1) * limit) : 0 )
	.limit(limit)
}

/**
 * Registers a users favorite post
 * 
 * @param{Object} user the user
 * @param{Object} post the post
 * @return{Promise}
*/
const createFavoritePost = (user, post) => {
	const favoritePost = new FavoritePost({
		user: {
			_id: user._id,
			username: user.username,
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

	return favoritePost.save()
}

/**
 * Remove a post from a users favorite
 * 
 * @param{Object} data the user and post id
 * @return{Promise}
*/
const removeFavoritePost = data => {
	return FavoritePost.deleteOne({
		'user._id': data.id,
		'post._id': data.postId
	})
}

/**
 * Removes a post from all favorites
 * 
 * @param{Object} data the post id
 * @return{Promise}
*/
const removeFavoritePosts = data => {
	return FavoritePost.deleteMany({
		'post._id': data.postId
	})
}

module.exports = {
	createFavoritePost,
	removeFavoritePost,
	getUserFavoritePost,
	getUserFavoritePostsId,
	getFavoritePosts,
	getAllFavoritePostsWithIds,
	removeFavoritePosts
}
