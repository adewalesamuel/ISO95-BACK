/**
 * User login middleware
 * Author: samueladewale
*/
const { hashPassword, getSessionToken, createSessionToken } = require('./../modules/authentication')
const { getUserWithPassword } = require('./../services/user')
const Log = require('./../modules/logging')

/**
 * Returns a session token for a new session on the client
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
const userLogin = async (req, res) => {
	const log = new Log(req)	

	// Checking if important fields are missing from the request body
	if (!req.body.username || !req.body.password ||
			req.body.username === '' || req.body.password === '') {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	let data = req.body
	data.username = data.username.toLowerCase()
	let user

	// Hashing the password
	try {
		const hashedPassword = await hashPassword(req.body.password)
		data.password = hashedPassword
	}catch(err){
		log.error(err)
		res.sendStatus(500)
		return
	}

	// Checking if the user exists
	try {
		user = await getUserWithPassword(data)
		
		if (!user) {
			res.sendStatus(404)
			log.error('The user was not found ')
			return
		}

	}catch(err) {
		log.error(err)
		res.sendStatus(500)
	}

	// Creating the session token and the data to send back
	try {
		let sessionToken = createSessionToken({id: user._id, password: user.password})
		res.json({
			id: user._id,
			sessionToken: sessionToken,
			fullname: user.fullname,
			username: user.username,
			profileUrl: user.profileUrl,
			relations: user.relations,
			description: user.description,
			email: user.email,
			tel: user.tel,
			website: user.website,
			place: user.place,
			grades: user.grades,
			posts: user.posts,
			favorites: user.favorites,
			new: user.new
		})
		log.info('Token sent')
	}catch(err) {
		log.error(err)
		res.sendStatus(500)
		return
	}

}

module.exports = userLogin