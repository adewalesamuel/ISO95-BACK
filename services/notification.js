/**
 * Notification service
 * Author: samueladewale
*/
const mongoose = require('mongoose')
const Notification = require('./../models/Notification')

const getUserNotification = data => {
	return Notification.findOne({
		'post._id': data.postId,
		'user._id': data.id
	})
}

/**
 * Registers a users favorite post
 * 
 * @param{Object} user the user
 * @param{Object} post the post
 * @return{Promise}
*/
const createNotification = (notif) => {
	const notification = new Notification({
		type: notif.type,
		sender: {
			_id: notif.sender.id,
			username: notif.sender.username,
			profileUrl: notif.sender.profileUrl
		},
		user: {
			_id: notif.user.id,
		},
		thumbnailUrl: notif.thumbnailUrl,
		time: new Date().getTime(),
		body: notif.body,
		url: notif.url,
		isViewed: false
	})

	return notification.save()
}

const removeNotificationById = data => {
	return Notification.deleteOne({
		'_id': data.notifId
	})
}

const removeUserNotification = notif => {
	return Notification.deleteMany({
		'user._id': notif.user.id,
		'sender._id': notif.sender.id,
		body: notif.body
	})
}

const getUserNotifications = data => {
	return Notification.find({
		'user._id': data.id,
		isViewed: false
	})
	.sort({time: -1})
}

const updateNotificationUserProfileUrl = data => {
	const profileUrl = `/uploads/profiles/${data.filename}`
	return Notification.updateMany(
		{ 'sender._id': data.id }, 
		{ $set: {
			'sender.profileUrl': profileUrl } })
}

module.exports = {
	createNotification,
	removeNotificationById,
	getUserNotifications,
	removeUserNotification,
	updateNotificationUserProfileUrl
}
