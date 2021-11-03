/**
 * View security service
 * Author: samueladewale
*/
const mongoose = require('mongoose')
const ViewedPost = require('./../models/ViewSecurity')

const getViewToken = data => {
	return ViewSecurity.findOne({
		ipAddress: data.ip,
		viewToken: data.token
	})
}

const registerViewToken = (data) => {
	const ViewSecurity = new ViewSecurity({
		ipAddress: data.ip,
		viewToken: data.token
	})
	return ViewSecurity.save()
}

module.exports = {
	registerViewToken,
	getViewToken,
}
