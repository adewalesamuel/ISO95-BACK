/**
 * Notification model
 * Author: samueladewale
*/
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Notification = mongoose.model('Notification', new Schema({
		type: String,
		sender: {
			_id: mongoose.Schema.Types.ObjectId,
			username: String,
			profileUrl: String
		},
		user: {
			_id: mongoose.Schema.Types.ObjectId,
		},
		thumbnailUrl: String,
		time: Number,
		body: String,
		url: String,
		isViewed: Boolean
}))

module.exports = Notification