/**
 * Relation model
 * Author: samueladewale
*/
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Relation = mongoose.model('Relation', new Schema({
	follower: {
		_id: mongoose.Schema.Types.ObjectId,
		username: String,
		profileUrl: String
	},
	following: {
		_id: mongoose.Schema.Types.ObjectId,
		username: String,
		profileUrl: String
	}
}))

module.exports = Relation