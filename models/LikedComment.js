/**
 * Liked comment model
 * Author: samueladewale
*/
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const LikedComment = mongoose.model('LikedComment', new Schema({
	user: {
		_id: mongoose.Schema.Types.ObjectId,
	},
	comment: {
		_id: mongoose.Schema.Types.ObjectId,
	}
}))

module.exports = LikedComment