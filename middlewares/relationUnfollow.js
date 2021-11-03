/**
 * Relation unfollow middleware
 * Author: samueladewale
*/
const { isValidToken, getAuthorizationBearerToken, getTokenPayload } = require('./../modules/authentication')
const { decreaseUserFollowers, decreaseUserFollowings } = require('./../services/user')
const { deleteRelation, getRelation } = require('./../services/relation')
const Log = require('./../modules/logging')

/**
 * Deletes a relation of a user
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function relationUnFollow(req, res) {
	const log = new Log(req)	

	// Checking if all the required fields in the body are correct
	if (!req.body.id || !req.body.id.trim() === '') {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	const userToUnfollow = req.body
	let user = {}
	let users = []

	// Checking if the authorization token is valid
	try {
		const sessionToken = getAuthorizationBearerToken(req)
		const tokenPayload = getTokenPayload(sessionToken)

		if ( !sessionToken || !isValidToken(sessionToken) || tokenPayload.type !== 'session') {
			res.sendStatus(401)
			log.error('Token is not valid')
			return
		}

		if ( tokenPayload.id === userToUnfollow.id ) {
			res.sendStatus(403)
			log.error('User cannot unfollow itself')
			return
		}

		user.id = tokenPayload.id // the id of the logged in user

	}catch(err) {
		res.sendStatus(500)
		log.error(err)
		return
	}

	// Checking if the user is already a follower
	try {
		const hasRelation = await getRelation(user, userToUnfollow)
		if (!hasRelation){
			res.sendStatus(403)
			log.error('There is no relation beetween users')
			return
		}

	}catch(err){
		res.sendStatus(500)
		log.error(err)
		return
	}

	// Deleting the relation
	try {
		const relation = await deleteRelation(user, userToUnfollow)
		res.sendStatus(200)
		log.info("Relation deleted")

	}catch(err) {
		res.sendStatus(500)
		log.error(err)
		return
	}

	// Decreasing relations count
	try {
		const relationsCount = await Promise.all([
			decreaseUserFollowers(userToUnfollow), 
			decreaseUserFollowings(user)
			])
		log.info("Relation count decreased")
	}catch(err) {
		log.error(err)
	} 

}

module.exports = relationUnFollow