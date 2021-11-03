/**
 * Notification deletion middleware
 * Author: samueladewale
*/
const { removeNotificationById } = require('./../services/notification')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Deletes a notification
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function notificationDeletion(req, res) {
	const log = new Log(req)	

	// Checking if all the required params are correct
	if (!req.body.notifId || req.body.notifId.trim() === '') {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}
	
	data = req.body

	// Checking if the authorazation token is valid
	try {
		const sessionToken = getAuthorizationBearerToken(req)
		const tokenPayload = getTokenPayload(sessionToken)

		if ( !sessionToken || !isValidToken(sessionToken) || tokenPayload.type !== 'session') {
			res.sendStatus(401)
			log.error('Token is not valid')
			return
		}

		data.id = tokenPayload.id // the id of the logged in user

	}catch(err) {
		res.sendStatus(500)
		log.error(err)
		return
	}

	// Deleting the notification
	try {
		await removeNotificationById(data)
		res.sendStatus(200)
		log.info('Notification deleted')
	}catch(err){
		res.sendStatus(500)
		log.error(err)
	}

}

module.exports = notificationDeletion