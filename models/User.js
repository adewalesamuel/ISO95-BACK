/**
 * User model
 * Author: samueladewale
*/
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = mongoose.model('User', new Schema({
		fullname: String,
		username: String,
		password: String,
		profileUrl: String,
		relations: {
			followers: Number,
			followings: Number,
		},
		description: String,
		email: String,
		tel: String,
		website: String,
		place: {
			city: String,
			country: String
		},
		grades: [String],
		posts: Number,
		favorites: Number,
		new: Boolean
}))

module.exports = User