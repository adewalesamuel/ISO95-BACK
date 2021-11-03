/**
 * View security model
 * Author: samueladewale
*/
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const VieweSecurity = mongoose.model('ViewedPost', new Schema({
	ipAddress: String,
	viewToken: String
}))

module.exports = VieweSecurity