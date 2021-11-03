/**
 * User Registration middleware
 * Author: samueladewale
*/
const { hashPassword, getSessionToken, createSessionToken } = require('./../modules/authentication')
const { createUser, getUser } = require('./../services/user')
const Log = require('./../modules/logging')

/**
 * Register a user if it doesn't already exist and connects the user
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function userRegistration (req, res) {
	const log = new Log(req)	

	// Checking if all the required fields in the body are correct
	if (!req.body.username || !req.body.email || !req.body.password ||
			req.body.username === '' || req.body.email === '' || req.body.password === '') {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	let data = req.body // the id of the logged in user
	data.username = data.username.toLowerCase()
	data.email = data.email.toLowerCase()
	let user

	// Checking if the user already exists
	try {
		const userExists = await getUser(data)
		if (userExists) {
			res.sendStatus(409)
			log.error('User already exists')
			return
		}
	}catch(err) {
		log.error(err)
	}

	// Creating a password
	try {
		const hashedPassword = await hashPassword(data.password)
		data.password = hashedPassword
	}catch(err){
		log.error(err)
		res.sendStatus(500)
		return
	}

	// Registering the new user
	try{
		user = await createUser(data)
	}catch(err) {
		log.error(err)	
		res.sendStatus(500)
	}

	// Creating the session token and the data to send back
	try {
		const sessionToken = createSessionToken({id: user._id, password: user.password})
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
		log.info('User created')
	}catch(err) {
		log.error(err)
		res.sendStatus(500)
		return
	}

}

module.exports = userRegistration