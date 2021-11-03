/**
 * User password token generation middleware
 * Author: samueladewale
*/
const { createPasswordRenewalToken } = require('./../modules/authentication')
const { getUserWithEmail } = require('./../services/user')
const { sendForgotPasswordMail } = require('./../modules/mailing')
const Log = require('./../modules/logging')

/**
 * Generates a token to renew the users passsword
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
const userPasswordTokenGeneration = async (req, res) => {
	const log = new Log(req)	

	// Checking if important fields are missing from the request body
	if (!req.body.email || req.body.email === '') {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	let data = req.body
	let user

	// Getting the user with the email if it exists
	try {
		user = await getUserWithEmail(data)
		if (!user) {
			res.sendStatus(404)
			log.error("The user was not found")
			return
		}
	}catch(err) {
		res.sendStatus(500)
		log.error(err)
		return
	}

	// Creating the token to renew the password
	try {
		const passwordRenewalToken = createPasswordRenewalToken({id: user._id, email: user.email})
		// Sending an email to the user with the token
		sendForgotPasswordMail(user, passwordRenewalToken).catch(err => log.error(err))
		res.sendStatus(200)
		log.info("Mail sent to the user")

	}catch(err){
		res.sendStatus(500)
		log.error(err)
	}

}

module.exports = userPasswordTokenGeneration