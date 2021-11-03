/**
 * Message list user middleware
 * Author: samueladewale
*/
const { getDiscussion } = require('./../services/message')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Displays a user received messages
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function messageListUser(req, res) {
	const log = new Log(req)	

	// Checking if important fields are missing from the request body
	if (!req.body.userId || req.body.userId.trim() === '' ) {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	let data = req.body
	
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

	// Getting the user messages
	try {
		const chat = await getDiscussion(data)
		log.info("Got chat")
		res.json(chat)
	}catch(err) {
		res.sendStatus(500)
		log.error(err)
	}

}

module.exports = messageListUser