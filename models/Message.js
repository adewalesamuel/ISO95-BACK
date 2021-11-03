/**
 * Message model
 * Author: samueladewale
*/
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Message = mongoose.model('Message', new Schema({
	sender: {
		_id: mongoose.Schema.Types.ObjectId,
		username: String,
		profileUrl: String
	},
	receiver: {
		_id: mongoose.Schema.Types.ObjectId,
	},
	time: Number,
	message: String,
	isViewed: Boolean
}))

module.exports = Message