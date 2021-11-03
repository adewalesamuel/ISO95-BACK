/**
 * Post like middleware
 * Author: samueladewale
*/

const { createLikedPost, getUserLikedPost, removeLikedPost } = require('./../services/likedPost')
const { getPost, decreasePostLikes, increasePostLikes } = require('./../services/post')
const { getUserWithId } = require('./../services/user')
const { createNotification, removeUserNotification } = require('./../services/notification')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const { sendLikedPostMail } = require('./../modules/mailing')
const Log = require('./../modules/logging')

/**
 * Liking or unliking a post
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function postLike(req, res) {
	const log = new Log(req)	

	// Checking if all the required params are correct
	if (!req.body.postId || !req.body.postId.trim() === '') {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	let user
	let post
	let liked = false
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

	// Getting the logged in user info
	try {
		user = await getUserWithId(data)
		log.info("Got user")
	}catch(err) {
		res.sendStatus(500)
		log.error(err)
		return
	}

	// Registering the like
	try {
		const likedPost = await getUserLikedPost(data)
		post = await getPost(data)

		// Checking if the user already like the post
		if ( !likedPost ) {
			await createLikedPost(user, post)
			await increasePostLikes(data)
			log.info("Post like registered")
			liked = true
		}else {
			// Unliking the post
			await removeLikedPost(data)
			await decreasePostLikes(data)
			log.info("Post unliked")
			liked = false
		}
		res.sendStatus(200)
	}catch(err) {
		res.sendStatus(500)
		log.error(err)
		return
	}

	// Notifying the post like
	try {
		const notif = {
			type: 'postLike',
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
			body: post.photo.alt
		}

		// Checking if the logged in user is the post owner
		if  ( user._id.toString() === post.user._id.toString()) return
		// If the post has been unliked
		if (!liked) {
			await removeUserNotification(notif)
			log.info("Notification Removed")
		}else {
			await createNotification(notif)
			log.info("Created Notification")

			//Sending a notification mail to the user
			const userTo = await getUserWithId(notif.user)
			sendLikedPostMail(user, userTo, post).catch(err => log.error(err))
			log.info("Notification Mail sent")
		}
	}catch(err){
		log.error(err)
	}

}

module.exports = postLike 