/**
 * Message sending middleware
 * Author: samueladewale
*/
const { createMessage } = require('./../services/message')
const { getUserWithId } = require('./../services/user')
const { createNotification } = require('./../services/notification')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const { sendMessageMail } = require('./../modules/mailing')
const Log = require('./../modules/logging')

/**
 * Save a message
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function messageSending(req, res) {
	const log = new Log(req)	

	// Checking if all the required params are correct
	if (!req.body.message || !req.body.userId || !req.body.userId.trim() === '') {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	let user
	const data = req.body

	// Checking if the authorization token is valid
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

	// Getting the logged in user info
	try {
		user = await getUserWithId(data)
		log.info("Got user")
	}catch(err) {
		res.sendStatus(500)
		log.error(err)
		return
	}

	// Saving the message
	try {
		await createMessage(data, user)
		log.info("Comment created")
		res.sendStatus(200)
	}catch(err){
		res.sendStatus(500)
		log.error(err)
		return
	}

	// Notifying the message
	try {
		const notif = {
			type: 'comment',
			sender: {
				id: user._id,
				username: user.username,
				profileUrl: user.profileUrl
			},
			user: {
				id: data.userId
			},
			thumbnailUrl: '',
			url: `/user/${user.username}`,
			body: data.comment
		}

		//Sending a notification mail to the user
		const userTo = await getUserWithId(notif.user)
		sendMessageMail(user, userTo).catch(err => log.error(err))
		log.info("Notification Mail sent")
	}catch(err){
		log.error(err)
	}
}

module.exports = messageSending