/**
 * Message view update middleware
 * Author: samueladewale
*/

const { updateUserNew } = require('./../services/user')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Registering a post view
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function userNewUpdate(req, res) {
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

		data.id = tokenPayload.id // the id of the logged in user

	}catch(err) {
		res.sendStatus(500)
		log.error(err)
		return
	}

	// Updating the user new
	try {
		await updateUserNew(data)
		log.info('User new updated')
		res.sendStatus(200)
	}catch(err) {
		res.sendStatus(500)
		log.error(err)
	}

}

module.exports = userNewUpdate 