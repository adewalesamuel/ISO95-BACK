/**
 * Comment service
 * Author: samueladewale
*/
const mongoose = require('mongoose')
const Message = require('./../models/Message')

/**
 * Saves a message
 *
 * @param{Object} data the message and id of the receiver
 * @param{Object} user the user id, username and profilUrl
 * @preturn{Promise}
*/
const createMessage = (data, user) => {
	const message = new Message({
 	sender: {
		_id: user._id,
		username: user.username,
		profileUrl: user.profileUrl
	},
	receiver: {
		_id: data.userId,
	},
	time: new Date().getTime(),
	message: data.message,
	isViewed: false
	})

 return message.save()
}

/**
 * Marks a message has viewed
 *
 * @param{Object} data the id of the sender and receiver
 * @preturn{Promise}
*/
const updateMessageView = data => {
	return Message.updateMany({
		'sender._id': data.senderId,
		'receiver._id': data.id
	},{
		$set: { isViewed: true }
	})
}

/**
 * Gets a user received message
 *
 * @param{Object} data the id of the user
 * @preturn{Promise}
*/
const getUserMessages = data => {
	return Message.find({
		'receiver._id': data.id
	})
	.sort({isViewed:1,time:-1})
}

/**
 * Gets a discussion beetween users
 *
 * @param{Object} data the id of the sender and receiver
 * @preturn{Promise}
*/
const getDiscussion = data => {
	return Message.find({
		'sender._id': { $in: [data.userId, data.id] },
		'receiver._id': { $in: [data.userId, data.id] },
	},{
		'sender.username': 0,
		'sender.profileUrl': 0,
		_id: 0,
		__v: 0,
		'receiver': 0
	})
	.sort({time: 1})
}


const deletePostComments = data => {
	return Comment.deleteMany({ 
		'post._id': data.postId
	})
}

const updateMessageUserProfileUrl = data => {
	const profileUrl = `/uploads/profiles/${data.filename}`
	return Message.updateMany(
		{ 'sender._id': data.id }, 
		{ $set: {
			'sender.profileUrl': profileUrl } })
}

module.exports = {
	createMessage,
	getDiscussion,
	updateMessageView,
	getUserMessages,
	updateMessageUserProfileUrl
}