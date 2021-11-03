/**
 * User profile middleware
 * Author: samueladewale
*/

const { getUserWithUsername } = require('./../services/user')
const { getUserFollowing } = require('./../services/relation')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Gets the users profile informations
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function userProfile (req, res) {
	const log = new Log(req)	

	// Checking if all the required params are correct
	if (!req.params.username || req.params.username.trim() === '') {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	let data = req.params

	// Checking if the authorization token is valid
	try {
		const sessionToken = getAuthorizationBearerToken(req)
		const tokenPayload = getTokenPayload(sessionToken)

		if ( !sessionToken || !isValidToken(sessionToken) || tokenPayload.type !== 'session') {
			data.id = ''
			log.error('Token is not valid')
		}else {
			data.id = tokenPayload.id // the id of the logged in user
		}

	}catch(err) {
		data.id = ''
		log.info('No token')
	}

	// Getting the user with the username if it exists
	try {
		let isUser = false
		let following = false
		const user = await getUserWithUsername(data)

		if ( !user ) {
			res.sendStatus(404)
			log.error("Could not find user")
			return
		}

		if (data.id && data.id !== '' ){
			const isFollowing = await getUserFollowing(data)
			if (isFollowing) following = true
		}

		if (data.id.toString() === user._id.toString()) isUser = true

		res.json({
			id: user._id,
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
			isFollowedByUser: following,
			isUser: isUser
		})

		log.info("User found")
	}catch(err){
		res.sendStatus(500)
		log.error(err)
	}

}

module.exports = userProfile