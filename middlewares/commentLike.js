/**
 * Comment like middleware
 * Author: samueladewale
*/

const { createLikedComment, getUserLikedComment, removeUserLikedComment } = require('./../services/likedComment')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const { createNotification, removeUserNotification } = require('./../services/notification')
const Log = require('./../modules/logging')

/**
 * Liking or unliking a comment
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function commentLike(req, res) {
	const log = new Log(req)	

	// Checking if all the required params are correct
	if (!req.body.postId || !req.body.postId.trim() === '' ||
		!req.body.commentId || !req.body.commentId.trim() === '') {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

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

	// Registering the like
	try {
		// Checking if the user already like the comment
		const likedComment = await getUserLikedComment(data)
		if ( !likedComment ) {
			await createLikedComment(data)
			log.info("Comment like registered")
		}else {
			// Unliking the comment
			await removeUserLikedComment(data)
			log.info("Comment unliked")
		}
		res.sendStatus(200)

	}catch(err) {
		res.sendStatus(500)
		log.error(err)
		return
	}

}

module.exports = commentLike 