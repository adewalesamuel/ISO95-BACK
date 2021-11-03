/**
 * User password token validation middleware
 * Author: samueladewale
*/
const { isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Validates the password token of the user
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
const userPasswordTokenValidation = async (req, res) => {
	const log = new Log(req)	

	// Checking if important fields are missing from the request body
	if (!req.body.passwordToken || req.body.passwordToken === '') {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	let data = req.body

	// Checking if the password token is valid
	try {
		const tokenPayload = getTokenPayload(data.passwordToken)

		if ( !isValidToken(data.passwordToken) || tokenPayload.type !== 'password' || 
			tokenPayload.exp < new Date().getTime() ) {
			res.sendStatus(403)
			log.error("The passwordToken is not valid")
			return
		}

		res.sendStatus(200)
		log.info("The token is valid")

	}catch(err) {
		res.sendStatus(500)
		log.error(err)
		return
	}

}

module.exports = userPasswordTokenValidation