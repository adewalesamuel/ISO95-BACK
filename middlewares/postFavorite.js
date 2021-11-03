/**
 * Post favorite add middleware
 * Author: samueladewale
*/

const { createFavoritePost, getUserFavoritePost, removeFavoritePost } = require('./../services/favoritePost')
const { getPost } = require('./../services/post')
const { getUserWithId } = require('./../services/user')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Saving a post as favorite
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function postFavorite(req, res) {
	const log = new Log(req)	

	// Checking if all the required params are correct
	if (!req.body.postId || !req.body.postId.trim() === '') {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	let user
	const data = req.body

	// Checking if the authorazation token is valid
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

	// Getting the logged in user
	try {
		user = await getUserWithId(data)
		log.info("Got user")
	}catch(err) {
		res.sendStatus(500)
		log.error(err)
		return
	}

	// Registering the post as a favorite
	try {
		let post
		let favoritePostCreated
		const favoritePost = await getUserFavoritePost(data)

		// Checking if the post is already a favorite
		if ( !favoritePost ) {
			post = await getPost(data)
			favoritePostCreated = await createFavoritePost(user, post)
			log.info("Favorite post registered")
		}else {
			favoritePostCreated = await removeFavoritePost(data)
			log.info("Favorite post deleted")
		}
		res.sendStatus(200)

	}catch(err) {
		res.sendStatus(500)
		log.error(err)
	}

}

module.exports = postFavorite