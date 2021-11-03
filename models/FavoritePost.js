/**
 * Liked post model
 * Author: samueladewale
*/
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const FavoritePost = mongoose.model('FavoritePost', new Schema({
	user: {
		_id: mongoose.Schema.Types.ObjectId,
		username: String
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

module.exports = FavoritePost