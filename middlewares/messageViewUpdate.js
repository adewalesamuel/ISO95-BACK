/**
 * Message view update middleware
 * Author: samueladewale
*/

const { updateMessageView } = require('./../services/message')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Registering a post view
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function messageViewUpdate(req, res) {
	const log = new Log(req)	

	// Checking if all the required params are correct
	if (!req.body.senderId || !req.body.senderId.trim() === '') {
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

	// Updating the message view
	try {
		await updateMessageView(data)
		log.info('Message view updated')
		res.sendStatus(200)
	}catch(err) {
		res.sendStatus(500)
		log.error(err)
	}

}

module.exports = messageViewUpdate 