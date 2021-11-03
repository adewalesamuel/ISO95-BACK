/**
 * User service
 * Author: samueladewale
*/
const mongoose = require('mongoose')
const User = require('./../models/User')

/**
 * Registers a user
 *
 * @param{Object} data the user fullname, username, password and email
 * @return{Promise}
*/
const createUser = data => {
	const user = new User({
		fullname: data.fullname ? data.fullname : '',
		username: data.username,
		password: data.password,
		profileUrl: '',
		relations: {
			followers: 0,
			followings: 0,
		},
		description: '',
		email: data.email,
		tel: '',
		website: '',
		place: {
			city: '',
			country: '',
		},
		grades: [],
		posts: 0,
		favorites: 0,
		new: true
	} )

	return user.save()
}

/**
 * Gets a user
 *
 * @param{Object} data the user username and password
 * @return{Promise}
*/
const getUser = data => {
	return User.findOne({
		$or: [
			{ username: data.username },
			{ email: data.email }
		]})
}

/**
 * Gets a number of popular users
 *
 * @params{Number} skip the users to skip
 * @params{Number} limit the user limit
 * @return{Promise}
*/
const getPopularUsers = (skip=0, limit=8) => {
	return User.find({
		$or: [
			{ 'relations.followers': { $gte: 0 } },
			{ posts: { $gte: 0 } }
		]
	}, { username: 1, profileUrl: 1 })
	.sort({ 
		'relations.followers': -1, 
		posts: -1 })
	.skip( skip > 0 ? ( (skip - 1) * limit) : 0 )
	.limit(limit)
}

/**
 * Gets a user by password
 *
 * @param{Object} data the user username and password
 * @return{Promise}
*/
const getUserWithPassword = data => {
	return User.findOne({
		$or: [
			{ username: data.username },
			{ email: data.username }
		],
		password: data.password
	})
}

/**
 * Gets a user by email
 *
 * @param{Object} data the user email
 * @return{Promise}
*/
const getUserWithEmail = data => {
	return User.findOne({ email: data.email })
}

/**
 * Gets a user by id
 *
 * @param{Object} data the user id
 * @return{Promise}
*/
const getUserWithId = data => {
	return User.findOne({ _id: data.id })
}

/**
 * Gets a user by a username
 *
 * @param{Object} data the user username
 * @return{Promise}
*/
const getUserWithUsername = data => {
	return User.findOne({ username: data.username })
}

/**
 * Updates a user password
 *
 * @param{Object} data the user new password
 * @return{Promise}
*/
const updateUserPassword = data => {
	return User.updateOne(
		{ _id: data.id }, 
		{ $set: { password: data.newPassword } })
}

/**
 * Updates a user informations
 *
 * @param{Object} data some user info
 * @return{Promise}
*/
const updateUser = data => {
	return User.updateOne(
		{ _id: data.id }, 
		{ $set: {
			fullname: data.fullname,
			description: data.description,
			place: {
				city: data.place.city,
				country: data.place.country
			},
			tel: data.tel,
			email: data.email,
			website: data.website
		} })
}

/**
 * Updates a user profile url
 *
 * @param{Object} data the user id and picture filename
 * @return{Promise}
*/
const updateUserProfileUrl = data => {
	const profileUrl = `/uploads/profiles/${data.filename}`
	return User.updateOne(
		{ _id: data.id }, 
		{ $set: {
			profileUrl: profileUrl } 
		})
}

/**
 * Increments the user followers count
 *
 * @param{Object} data the user id
 * @return{Promise}
*/
const increaseUserFollowers = data => {
	return User.updateOne(
		{ _id: data.id }, 
		{ $inc: {	'relations.followers': 1 } })
}

/**
 * Decrements the user followers count
 *
 * @param{Object} data the user id
 * @return{Promise}
*/
const decreaseUserFollowers = data => {
	return User.updateOne(
		{ _id: data.id }, 
		{ $inc: {	'relations.followers': -1 } })
}

/**
 * Increments the user followings count
 *
 * @param{Object} data the user id
 * @return{Promise}
*/
const increaseUserFollowings = data => {
	return User.updateOne(
		{ _id: data.id }, 
		{ $inc: {	'relations.followings': 1 } })
}

/**
 * Decrements the user followings count
 *
 * @param{Object} data the user id
 * @return{Promise}
*/
const decreaseUserFollowings = data => {
	return User.updateOne(
		{ _id: data.id }, 
		{ $inc: {	'relations.followings': -1 } })
}

/**
 * Increments the user post count
 *
 * @param{Object} data the user id
 * @return{Promise}
*/
const increaseUserPosts = data => {
	return User.updateOne(
		{ _id: data.id }, 
		{ $inc: {	'posts': 1 } })
}

/**
 * Decrements the user post count
 *
 * @param{Object} data the user id
 * @return{Promise}
*/
const decreaseUserPosts = data => {
	return User.updateOne(
		{ _id: data.id }, 
		{ $inc: {	'posts': -1 } })
}

const updateUserNew = data => {
	return User.updateOne({ 
		_id: data.id 
	},{ $set: { new: false } }
	) 
}


module.exports = {
	createUser,
	getUser,
	getUserWithPassword,
	getUserWithEmail,
	getUserWithId,
	updateUserPassword,
	updateUserProfileUrl,
	getUserWithUsername,
	updateUser,
	increaseUserFollowers,
	decreaseUserFollowers,
	increaseUserFollowings,
	decreaseUserFollowings,
	getPopularUsers,
	increaseUserPosts,
	decreaseUserPosts,
	updateUserNew
}
