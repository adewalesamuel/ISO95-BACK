/**
 * Viewed post model
 * Author: samueladewale
*/
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const PostView = mongoose.model('PostView', new Schema({
	user: {
		_id: mongoose.Schema.Types.ObjectId,
		username: String, 
		profileUrl: String
	},
	post: {
		_id: mongoose.Schema.Types.ObjectId,
		photo: {
			alt: String,
		},
		place: {
			city: String,
			country: String
		},
		tags: [String]
	}
}))

module.exports = PostView