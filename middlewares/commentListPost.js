/**
 * Comment list middleware
 * Author: samueladewale
*/
const { getPostComments } = require('./../services/comment')
const { getUserLikedComments } = require('./../services/likedComment')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Displays the post comments
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function commentListPost(req, res) {
	const log = new Log(req)	

	// Checking if all the required params are correct
	if (!req.params.postId || !req.params.postId.trim() === '' ||
		!req.params.page || !req.params.page.trim() === '') {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	const data = req.params
	const page = req.params.page

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

	// Getting the post comments
	try {
		let commentList = []

		const postComments = await getPostComments(data, page)
		log.info("Got post comments")
		postComments.forEach( postComment => {
			commentList.push({
      user: {
          id: postComment.user._id,
          username: postComment.user.username,
          profileUrl: postComment.user.profileUrl
      },
      id: postComment._id,
      comment: postComment.comment,
      time: postComment.time
			})
		} )

		res.json(commentList)
		log.info("Got post comments")
	}catch(err) {
		res.sendStatus(500)
		log.error(err)
		return
	}

}

module.exports = commentListPost