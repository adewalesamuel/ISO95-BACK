/**
 * Relation following middleware
 * Author: samueladewale
*/
const { getAllFollowings, getAllRelations } = require('./../services/relation')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Get a users following
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function relationFollowing(req, res) {
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

	// Getting a user followings
	try {
		let userList = []

		// Gettings the user followings
		const followings = await getAllFollowings(data, page)
		let followingsIds = followings.map( item => item.following._id )
		log.info("Got followings")

		// Getting the loggedin user followings ids from the user followings ids
		const relations = await getAllRelations(data, followingsIds)
		let userFollowingsIds = relations.map( item => item.following._id )
		log.info('Got relations')

		// Checking if the user is following the followings
		followings.forEach( (following, index) => {
			let isFollowing = false
			if ( userFollowingsIds.filter( userFollowingId => userFollowingId.toString() === following.following._id.toString() ).length > 0 ) {
				isFollowing = true
			}
			userList.push({
	       id: following.following._id,
	       username: following.following.username,
	       profileUrl: following.following.profileUrl,
	       isFollowedByUser: isFollowing
			})
		} )

		res.json(userList)
		log.info('Got all followings')

	}catch(err) {
		res.sendStatus(500)
		log.error(err)
		return
	} 

}

module.exports = relationFollowing