/**
 * Relation follow middleware
 * Author: samueladewale
*/
const { isValidToken, getAuthorizationBearerToken, getTokenPayload } = require('./../modules/authentication')
const { getUserWithId, increaseUserFollowers, increaseUserFollowings, decreaseUserFollowers, decreaseUserFollowings } = require('./../services/user')
const { createRelation, getRelation, deleteRelation } = require('./../services/relation')
const { createNotification, removeUserNotification } = require('./../services/notification')
const { sendFollowerMail } = require('./../modules/mailing')
const Log = require('./../modules/logging')

/**
 * Creates a relation of a user
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function relationFollow(req, res) {
	const log = new Log(req)	

	// Checking if all the required fields in the body are correct
	if (!req.body.id || !req.body.id.trim() === '') {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	let users
	let user = {}
	let isFollowing = false
	const userToFollow = req.body


	// Checking if the authorization token is valid
	try {
		const sessionToken = getAuthorizationBearerToken(req)
		const tokenPayload = getTokenPayload(sessionToken)
		
		if ( !sessionToken || !isValidToken(sessionToken) || tokenPayload.type !== 'session') {
			res.sendStatus(401)
			log.error('Token is not valid')
			return
		}

		if ( tokenPayload.id === userToFollow.id ) {
			res.sendStatus(403)
			log.error('User cannot follow itself')
			return
		}

		user.id = tokenPayload.id // the id of the logged in user

	}catch(err) {
		res.sendStatus(500)
		log.error(err)
		return
	}

	// Following the user
	try {
		// Getting the relation beetween the users
		const relation = await getRelation(user, userToFollow)

		// Getting the users
		users = await Promise.all([getUserWithId(user), getUserWithId(userToFollow)])

		// Checking if the logged in user is already a follower
		if (relation){
			// Unfollowing the user
			await deleteRelation(user, userToFollow)
			log.info('User is already a follower')
			log.info("Relation deleted")

			// Decreasing followers and followings counts
			await Promise.all([
				decreaseUserFollowers(userToFollow), 
				decreaseUserFollowings(user)
				])
			log.info("Relation count decreased")
			res.sendStatus(200)
		}else {// The logged in user is not a follower

			if ( !users[1] ) {
				res.sendStatus(404)
				log.error('User not found')
				return
			}

			// Registering the relation
			await createRelation(users[0], users[1])
			log.info("Relation created")

			// Inscreasing followers and followings counts
			await Promise.all([
				increaseUserFollowers(userToFollow), 
				increaseUserFollowings(user)
				])
			log.info("Relation count inscreased")
			isFollowing = true

			res.sendStatus(200)
		}

	}catch(err){
		res.sendStatus(500)
		log.error(err)
		return
	}

	// Notifying the following
	try {
		const notif = {
			type: 'follower',
			sender: {
				id: users[0]._id,
				username: users[0].username,
				profileUrl: users[0].profileUrl
			},
			user: {
				id: users[1]._id
			},
			thumbnailUrl: '',
			url: `/user/${users[0].username}`,
			body: ''
		}

		// If the user is not already a follower
		if ( !isFollowing ) {
			await removeUserNotification(notif)
			log.info("Notification Removed")
		}else {
			// Creating the notification
			await createNotification(notif)
			log.info("Created Notification")

			// Sending a notification mail to the user
			sendFollowerMail(users[0], users[1]).catch(err => log.error(err))
			log.info("Notification Mail sent")
		}
	}catch(err){
		log.error(err)
	}

}

module.exports = relationFollow