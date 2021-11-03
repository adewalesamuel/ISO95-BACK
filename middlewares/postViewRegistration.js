/**
 * Post view registration middleware
 * Author: samueladewale
*/

const { increasePostViews, getPost } = require('./../services/post')
const { createPostView, getUserPostView } = require('./../services/postView')
const { getUserWithId } = require('./../services/user')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Registering a post view
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function postViewRegistration(req, res) {
	const log = new Log(req)	

	// Checking if all the required params are correct
	if (!req.body.postId || !req.body.postId.trim() === '') {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	let user
	const data = req.body

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

	// Registering the view
	try {
		// If the user is logged in
		if ( data.id && data.id !== '' ) {
			// Getting the user
			user = await getUserWithId(data)
			log.info('Got user')

			// Getting the viewing post
			const post = await getPost(data)
			log.info('Got post')

			// Registering the post view of the user
			const postView = await getUserPostView(user, post)
			if ( !postView ) await createPostView(user, post)
			log.info('Post view created')
		}

		// Increasing the post view count
		await increasePostViews(data)
		log.info('Post view inscreased')
		res.sendStatus(200)
	}catch(err) {
		res.sendStatus(500)
		log.error(err)
	}

}

module.exports = postViewRegistration 