/**
 * Comment register middleware
 * Author: samueladewale
*/
const { createComment } = require('./../services/comment')
const { increasePostComments } = require('./../services/post')
const { getUserWithId } = require('./../services/user')
const { getPost } = require('./../services/post')
const { createNotification } = require('./../services/notification')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const { sendPostCommentMail } = require('./../modules/mailing')
const Log = require('./../modules/logging')

/**
 * Registers a post comment
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function commentRegistration(req, res) {
	const log = new Log(req)	

	// Checking if all the required params are correct
	if (!req.body.postId || !req.body.postId.trim() === '' ||
		!req.body.comment || !req.body.comment.trim() === '') {
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

	// Getting the logged in user info
	try {
		user = await getUserWithId(data)
		log.info("Got user")
	}catch(err) {
		res.sendStatus(500)
		log.error(err)
		return
	}

	// Creating the user post comment
	try {
		await createComment(data, user)
		log.info("Comment created")
		res.sendStatus(200)

		await increasePostComments(data)
		log.info("Post comment count inscreased")

	}catch(err){
		res.sendStatus(500)
		log.error(err)
		return
	}

	// Notifying the post comment
	try {
		const post = await getPost(data)
		const notif = {
			type: 'comment',
			sender: {
				id: user._id,
				username: user.username,
				profileUrl: user.profileUrl
			},
			user: {
				id: post.user._id
			},
			thumbnailUrl: post.thumbnail.mobile.url,
			url: `/post/${post.publicId}`,
			body: data.comment
		}

		await createNotification(notif)
		log.info("Created Notification")

		//Sending a notification mail to the user
		const userTo = await getUserWithId(notif.user)
		sendPostCommentMail(user, userTo, post).catch(err => log.error(err))
		log.info("Notification Mail sent")
	}catch(err){
		log.error(err)
	}
}

module.exports = commentRegistration