/**
 * User password renew middleware
 * Author: samueladewale
*/
const { updateUserPassword } = require('./../services/user')
const { hashPassword, getTokenPayload, isValidToken } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Generates a new password for the user
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
const userPasswordRenew = async (req, res) => {
	const log = new Log(req)	

	// Checking if important fields are missing from the request body
	if (!req.body.id || req.body.id.trim() === '' || !req.body.newPassword || req.body.newPassword.trim() === '') {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	let data = req.body

	// Checking if the password token is valid
	try {
		const tokenPayload = getTokenPayload(data.id)

		if ( !isValidToken(data.id) || tokenPayload.type !== 'password' || 
			tokenPayload.exp < new Date().getTime() ) {
			res.sendStatus(403)
			log.error("The passwordToken is not valid")
			return
		}

		data.id = tokenPayload.id

	}catch(err) {
		log.error(err)
		res.sendStatus(500)
		return
	}

	// Creating the new password
	try {
		const hashedPassword = await hashPassword(data.newPassword)
		data.newPassword = hashedPassword
	}catch(err){
		res.sendStatus(500)
		log.error(err)
		return
	}

	// Updates the old password
	try {
		let updatedPassword = await updateUserPassword(data)
		if ( updatedPassword.n === 0 ) {
			res.sendStatus(404)
			log.error("The user was not found")
			return
		}

		res.sendStatus(200)
		log.info("Password updated")

	}catch(err) {
		res.sendStatus(500)
		log.error(err)
	}


}

module.exports = userPasswordRenew