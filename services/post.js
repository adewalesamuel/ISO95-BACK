/**
 * User service
 * Author: samueladewale
*/
const mongoose = require('mongoose')
const Post = require('./../models/Post')

/**
 * Creates a post with a picture
 *
 * @param{Object} data the user object and post publicid
 * @param{Object} photo the picture infos
 * @return{Promise}
*/
const createPostWithPhoto = (data, photo) => {
	const post = new Post({
		publicId: data.publicId,
		user: {
			_id: data.id,
			username: data.username,
			profileUrl: data.profileUrl
		},
		thumbnail: { // For explore, user post, search
			desktop: {
				size: {
					width: photo.thumbnail.desktop.size.width, // 554
					height: photo.thumbnail.desktop.size.height // 610 305
				},
				url: `/${photo.thumbnail.desktop.url}`
			},
			mobile: {
				size: {
					width: photo.thumbnail.mobile.size.width, // 406
					height: photo.thumbnail.mobile.size.height // 447 223
				},
				url: `/${photo.thumbnail.mobile.url}`
			}
		},
		photo: {
			alt: '',
			desktop: {
				quality: {
					medium: { // For feed
						size: {
							width: photo.desktop.quality.medium.size.width, //900
							height: photo.desktop.quality.medium.size.height
						},
						url: `/${photo.desktop.quality.medium.url}`
					},
					high: { // For post
						size: {
							width: photo.desktop.quality.high.size.width, //1900
							height: photo.desktop.quality.high.size.height
						},
						url: `/${photo.desktop.quality.high.url}`
					}
				}
			},
			mobile: {
				size: {
					width: photo.mobile.size.width, //554
					height: photo.mobile.size.height
				},
				url: `/${photo.mobile.url}`
			}
		},
		time: new Date().getTime(),
		likes: 0,
		comments: 0,
		views: 0,
		caption: "",
		place: {
			city: "",
			country: ""
		},
		camera: {
			name: "",
			shutterSpeed: "",
			focalLength: "",
			iso: "",
			aperture: ""
		},
		tags: []
	} )

	return post.save()
}

/**
 * Update a post infos
 *
 * @param{Object} data the post infos
 * @return{Promise}
*/
const updatePostInfo = (data) => {
	return Post.updateOne({
		publicId: data.publicId, 
		'user._id': data.id
	},{
		$set: {
			caption: data.caption,
			place: {
				city: data.place.city,
				country: data.place.country
			},
			camera: {
				name: data.camera.name,
				shutterSpeed: data.camera.shutterSpeed,
				focalLength: data.camera.focalLength,
				iso: data.camera.iso,
				aperture: data.camera.aperture
			},
			tags: [...data.tags]
		}
	} )
}

/**
 * Updates a posts alt
 *
 * @param{Object} data the post publicId and the photo alt
 * @return{Promise}
*/
const updatePostAltByPublicId = (data) => {
	return Post.updateOne({ 
		publicId: data.publicId,
		'user._id': data.id
	}, 
		{ $set: {'photo.alt': data.alt } })
}

/**
 * Gets a post by its publcid
 *
 * @param{Object} data the post publicid
 * @return{Promise}
*/
const getPostById = (data) => {
	return 	Post.findOne( { 
		publicId: data.publicId
	 }, { thumbnail: 0} )
}

/**
 * Gets posts by their ids
 *
 * @param{Array} ids the posts ids
 * @return{Promise}
*/
const getPostsByIds = (ids) => {
	return 	Post.find( { 
		_id: { $in: [...ids] }
	 },{ 
	 	place: 0,
	 	camera: 0,
	 	tags: 0,
	 	caption: 0,
	 	'photo.desktop.quality.high': 0
	 } )
}

/**
 * Gets a post by its id
 *
 * @param{Object} data the post id
 * @return{Promise}
*/
const getPost = (data) => {
	return 	Post.findOne( { 
		_id: data.postId
	 } )
}

/**
 * Gets the most recent post
 *
 * @param{Object} data the post id
 * @return{Promise}
*/
const getLatestPost = (data) => {
	return 	Post.findOne({
		time: { $gt: data.time }
	},{
	  user: 1,
		'thumbnail.mobile.url': 1,
	})
	.sort({time: -1})
}

/**
 * Gets a user post by id
 *
 * @param{Object} data the post id
 * @return{Promise}
*/
const getUserPostById = (data) => {
	return 	Post.findOne( { 
		_id: data.postId,
		'user._id': data.id
	 },{ _id: 1 } )
}

/**
 * Gets the best posts of the week
 *
 * @params{Number} skip the posts to skip
 * @params{Number} limit the posts limit
 * @return{Promise}
*/
const getBestWeekPosts = (skip=0, limit=9) => {
	return 	Post.find({
		time: { $gt: new Date().getTime() - ( 1000 * 60 * 60 * 24 * 7 )},
		$or: [
			{ likes: { $gt: 1} },
			{ views: { $gt: 1} }
		]
	},{ 
	  thumbnail: 0,
	 	place: 0,
	 	camera: 0,
	 	tags: 0,
	 	caption: 0,
	 	'photo.desktop.quality.high': 0
	 })
	.sort({likes: -1, views: -1 })
	.skip( skip > 0 ? ( (skip - 1) * limit) : 0 )
	.limit(limit)

}

/**
 * Gets the best posts
 *
 * @params{Number} skip the posts to skip
 * @params{Number} limit the posts limit
 * @return{Promise}
*/
const getBestPosts = (skip=0, limit=9) => {
	return 	Post.find({},{ 
	 	place: 0,
	 	camera: 0,
	 	tags: 0,
	 	caption: 0,
	 	'photo.desktop': 0
	 })
	.sort({ likes: -1, views: -1, time: -1 })
	.skip( skip > 0 ? ( (skip - 1) * limit) : 0 )
	.limit(limit)

}

/**
 * Gets all a user posts
 *
 * @param{Object} data the user username
 * @params{Number} skip the posts to skip
 * @params{Number} limit the posts limit
 * @return{Promise}
*/
const getUserPosts = (data, skip=0, limit=9) => {
	return Post.find( { 
		'user.username': data.username
	 },{ 
	 	place: 0,
	 	camera: 0,
	 	tags: 0,
	 	caption: 0,
	 	'photo.desktop': 0
	 } )
	.sort({ time: -1 })
	.skip( skip > 0 ? ( (skip - 1) * limit) : 0 )
	.limit(limit)
}

/**
 * Delete a users post and returns it
 *
 * @param{Object} data the user and post id
 * @return{Promise}
*/
const findAndDeleteUserPost = (data) => {
	return 	Post.findOneAndDelete( { 
		'user._id': data.id,
		_id: data.postId
	 } )
}

/**
 * Gets the specified users posts
 *
 * @param{Array} users the users ids
 * @params{Number} skip the posts to skip
 * @params{Number} limit the posts limit
 * @return{Promise}
*/
const getUsersPosts = (users, skip=0, limit=9) => {
	return 	Post.find( { 
		'user._id': { $in: [...users] }
	 },{ 
	 	place: 0,
	 	camera: 0,
	 	tags: 0,
	 	caption: 0,
	 	'photo.desktop.quality.high': 0
	 } )
	.sort({ time: -1 })
	.skip( skip > 0 ? ( (skip - 1) * limit) : 0 )
	.limit(limit)
}

/**
 * Gets posts by some attribtues
 *
 * @param{Array} data the tags, countries and cities
 * @params{Number} skip the posts to skip
 * @params{Number} limit the posts limit
 * @return{Promise}
*/
const getDiscoverPosts = (data, skip=0, limit=9) => {
	return 	Post.find( { // Thinking about removing the followings posts from the list but I am too lazy for that right now. Maybe next year.
		$or: [
			{ tags: { $in: [...data.tags] } },
			{ 'place.country': { $in: [...data.country] } },
			{ 'place.city': { $in: [...data.city] } },
		]
	 },{ 
	 	place: 0,
	 	camera: 0,
	 	tags: 0,
	 	caption: 0,
	 	'photo.desktop': 0
	 } )
	.sort({ time: -1, likes: -1, views: -1 })
	.skip( skip > 0 ? ( (skip - 1) * limit) : 0 )
	.limit(limit)
}

/**
 * Gets posts by tags
 *
 * @param{Array} data the tags
 * @params{Number} skip the posts to skip
 * @params{Number} limit the posts limit
 * @return{Promise}
*/
const getPostsByTags = (data, skip=0, limit=9) => {
	return 	Post.find( { // Thinking about removing the followings posts from the list but I am too lazy for that right now. Maybe next year.
		tags: { $in: [...data.tags] }
	 },{ 
	 	place: 0,
	 	camera: 0,
	 	tags: 0,
	 	caption: 0,
	 	'photo.desktop': 0
	 } )
	.sort({ views: -1, times: -1, likes: -1})
	.skip( skip > 0 ? ( (skip - 1) * limit) : 0 )
	.limit(limit)
}

/**
 * Gets posts from a search query
 *
 * @param{Array} data the search query
 * @params{Number} skip the posts to skip
 * @params{Number} limit the posts limit
 * @return{Promise}
*/
const getPostBySearchQuery = (data, skip=0, limit=9) => {
	return 	Post.find( {
		$or: [
			{ tags: new RegExp(data.q,'i') },
			{ 'place.country': new RegExp(data.q,'i') },
			{ 'place.city': new RegExp(data.q,'i') }
		]
	 },{ 
	 	place: 0,
	 	camera: 0,
	 	tags: 0,
	 	caption: 0,
	 	'photo.desktop': 0
	 } )
	.skip( skip > 0 ? ( (skip - 1) * limit) : 0 )
	.limit(limit)
}

/**
 * Increments the post likes count
 *
 * @param{Object} data the post id
 * @return{Promise}
*/
const increasePostLikes = (data) => {
	return Post.updateOne(
		{ _id: data.postId }, 
		{ $inc: {	likes: 1 } })
}

/**
 * Decrements the post likes count
 *
 * @param{Object} data the post id
 * @return{Promise}
*/
const decreasePostLikes = (data) => {
	return Post.updateOne(
		{ _id: data.postId }, 
		{ $inc: {	likes: -1 } })
}

/**
 * Increments the post view count
 *
 * @param{Object} data the post id
 * @return{Promise}
*/
const increasePostViews = (data) => {
	return Post.updateOne(
		{ _id: data.postId }, 
		{ $inc: {	views: 1 } })
}

/**
 * Updates a users profile url
 *
 * @param{Object} data the post id
 * @return{Promise}
*/
const updatePostProfileUrl = (data) => {
	const profileUrl = `/uploads/profiles/${data.filename}`
	return Post.updateMany(
		{ 'user._id': data.id }, 
		{ $set: {
			'user.profileUrl': profileUrl } })
}

/**
 * Decrements the post comments count
 *
 * @param{Object} data the post id
 * @return{Promise}
*/
const increasePostComments = (data) => {
	return Post.updateOne(
		{ _id: data.postId }, 
		{ $inc: {	comments: 1 } })
}

/**
 * Increments the post comment count
 *
 * @param{Object} data the post id
 * @return{Promise}
*/
const decreasePostComments = (data) => {
	return Post.updateOne(
		{ _id: data.postId }, 
		{ $inc: {	comments: -1 } })
}

module.exports = {
	createPostWithPhoto,
	getPostById,
	getPost,
	findAndDeleteUserPost,
	updatePostInfo,
	getUserPosts,
	getUsersPosts,
	increasePostLikes,
	decreasePostLikes,
	getPostsByIds,
	getBestWeekPosts,
	increasePostViews,
	getDiscoverPosts,
	getBestPosts,
	updatePostProfileUrl,
	getPostBySearchQuery,
	getPostsByTags,
	updatePostAltByPublicId,
	increasePostComments,
	decreasePostComments,
	getUserPostById,
	getLatestPost
}
