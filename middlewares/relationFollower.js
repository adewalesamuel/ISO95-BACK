/**
 * Relation follower middleware
 * Author: samueladewale
*/
const { getAllFollowers, getAllRelations } = require('./../services/relation')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Get a users followers
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function relationFollower(req, res) {
	const log = new Log(req)	

	// Checking if all the required params are correct
	if (!req.params.username || !req.params.username.trim() === '' || 
		!req.params.page || !req.params.page.trim() === '') {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	const data = req.params
	const page = req.params.page

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

	// Getting the users followers
	try {
		let userList = []

		// Gettings the user followers
		const followers = await getAllFollowers(data, page)
		let followersIds = followers.map( item => item.follower._id )
		log.info("Got followers")

		// Getting the logged in user followings ids from the user followers ids
		const relations = await getAllRelations(data, followersIds)
		let followingsIds = relations.map( item => item.following._id )
		log.info('Got relations')

		// Checking if the user is following the followers
		followers.forEach( (follower, index) => {
			let following = false
			if ( followingsIds.filter( followingsId => followingsId.toString() === follower.follower._id.toString() ).length > 0 ) {
				following = true
			}
			userList.push({
		     id: follower.follower._id,
		     username: follower.follower.username,
		     profileUrl: follower.follower.profileUrl,
		     isFollowedByUser: following
			})
		} )

		res.json(userList)
		log.info('Got all followers')

	}catch(err) {
		res.sendStatus(500)
		log.error(err)
		return
	} 

}

module.exports = relationFollower