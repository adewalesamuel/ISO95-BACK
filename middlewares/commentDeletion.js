/**
 * Comment deletion middleware
 * Author: samueladewale
*/
const { removeLikedComment } = require('./../services/likedComment')
const { deleteComment } = require('./../services/comment')
const { getUserPostById, decreasePostComments } = require('./../services/post')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Deletes a comment
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function commentDeletion(req, res) {
	const log = new Log(req)	

	// Checking if all the required params are correct
	if (!req.body.postId || req.body.postId.trim() === '' ||
		!req.body.commentId || req.body.commentId.trim() === '') {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}
	
	data = req.body

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

	//Checking if the logged in user is the owner of the post
	try {
		// Getting the post
		const userPost = await getUserPostById(data)
		if (!userPost) {
			log.error('User post not found')
			res.sendStatus(404)
			return
		}

	}catch(err) {
		res.sendStatus(500)
		log.error(err)
		return
	}

	// Deleting the comment
	try {
		await Promise.all([
			deleteComment(data), 
			decreasePostComments(data)
		])
		res.sendStatus(200)
		log.info('Comment deleted')
	}catch(err){
		res.sendStatus(500)
		log.error(err)
	}

}

module.exports = commentDeletion