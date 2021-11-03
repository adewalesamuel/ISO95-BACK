/**
 * Relation service
 * Author: samueladewale
*/
const mongoose = require('mongoose')
const Relation = require('./../models/Relation')

/**
 * Creates a relation beetween two users
 *
 * @param{Object} userData the follower user
 * @param{Object} userToFollowData the followed user
 * @return{Promise}
*/
const createRelation = (userData, userToFollowData) => {
	const relation = new Relation({
		follower: {
		_id: userData.id,
		username: userData.username,
		profileUrl: userData.profileUrl
	},
	following: {
		_id: userToFollowData.id,
		username: userToFollowData.username,
		profileUrl: userToFollowData.profileUrl
	}
	} )

	return relation.save()
}

/**
 * Deletes a relation beetween two user
 *
 * @param{Object} userData the follower user id
 * @param{Object} userToUnFollowData the unfollowed user id
 * @return{Promise}
*/
const deleteRelation = (userData, userToUnfollowData) => {
	return Relation.deleteOne({
		'follower._id': userData.id,
		'following._id': userToUnfollowData.id
	} )

	return relation.save()
}

/**
 * Gets a relation beetween two users
 *
 * @param{Object} userData the follower user id
 * @param{Object} userToFollowData the followed user id
 * @return{Promise}
*/
const getRelation = (userData, followedUserData) => {
	return Relation.findOne({
		'follower._id': userData.id,
		'following._id': followedUserData.id
	} )
}

/**
 * Gets a user followers
 *
 * @param{Object} data the user username
 * @param{Object} skip the followers to skip 
 * @param{Object} limit the followers to limit
 * @return{Promise}
*/
const getAllFollowers = (data, skip=0, limit=16) => {
	return Relation.find({
		'following.username': data.username
	}, { follower: 1 } )
	.skip( skip > 0 ? ( (skip - 1) * limit) : 0 )
	.limit(limit)
}


/**
 * Gets a user followings
 *
 * @param{Object} data the data of the users
 * @param{Object} skip the followings to skip 
 * @param{Object} limit the followings to limit
 * @return{Promise}
*/
const getAllFollowings = (data, skip=0, limit=16) => {
	return Relation.find({
		'follower.username': data.username
	}, { following: 1 } )
	.skip( skip > 0 ? ( (skip - 1) * limit) : 0 )
	.limit(limit)
}

/**
 * Gets a user following
 *
 * @param{Object} data the user id and username
 * @return{Promise}
*/
const getUserFollowing = data => {
	return Relation.findOne({
		'follower._id': data.id,
		'following.username': data.username
	})
}


/**
 * Gets all a user followings by id
 *
 * @param{Object} data the id of the user
 * @return{Promise}
*/
const getAllFollowingsById = data => {
	return Relation.find({
		'follower._id': data.id
	}, { 'following._id': 1 } )
}

/**
 * Gets all a user relations ids
 *
 * @param{Object} data the id of the user
 * @param{Object} ids the id of the users
 * @return{Promise}
*/
const getAllRelations = (data, ids) => {
	return Relation.find({
		'follower._id': data.id,
		'following._id': { $in: [...ids] }
	} )
}

/**
 * Updates a follower profile url
 *
 * @param{Object} data the id of the user and filename of the picture
 * @return{Promise}
*/
const updateFollowerProfileUrl = data => {
	const profileUrl = `/uploads/profiles/${data.filename}`
	return Relation.updateMany(
		{ 'follower._id': data.id }, 
		{ $set: { 'follower.profileUrl': profileUrl } })
}

/**
 * Updates a following profile url
 *
 * @param{Object} data the id of the user and filename of the picture
 * @return{Promise}
*/
const updateFollowingProfileUrl = (data) => {
	const profileUrl = `/uploads/profiles/${data.filename}`
	return Relation.updateMany(
		{ 'following._id': data.id }, 
		{ $set: { 'following.profileUrl': profileUrl } })
}

module.exports = {
	createRelation,
	getRelation,
	getAllFollowers,
	getAllFollowings,
	deleteRelation,
	getAllFollowingsById,
	updateFollowingProfileUrl,
	updateFollowerProfileUrl,
	getUserFollowing,
	getAllRelations
}
