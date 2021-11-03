/**
 * Notification list user middleware
 * Author: samueladewale
*/

const { getUserNotifications } = require('./../services/notification')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Display a list of notifications for the logged in user
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function notificationListUser(req, res) {
	const log = new Log(req)
	let data = {}

	// Checking if the authorazation token is valid
	try {
		const sessionToken = getAuthorizationBearerToken(req)
		const tokenPayload = getTokenPayload(sessionToken)

		if ( !sessionToken || !isValidToken(sessionToken) || tokenPayload.type !== 'session') {
			res.sendStatus(401)
			log.error('Token is not valid')
			return
		}

		data.id = tokenPayload.id // The id of the logged in user 

	}catch(err) {
		res.sendStatus(500)
		log.error(err)
		return
	}

	// Gettings the users notifications
	try {
		// Getting the logged in user notifications
		const userNotifications = await getUserNotifications(data) 
		res.json(userNotifications)
		log.info("Got user notifications")
	}catch(err) {
		res.sendStatus(500)
		log.error(err)
		return
	}

}

module.exports = notificationListUser