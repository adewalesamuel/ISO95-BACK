/**
 * User popular middleware
 * Author: samueladewale
*/

const { getPopularUsers } = require('./../services/user')
const { getAllRelations } = require('./../services/relation')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Gets the most active and popular users
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function userPopular (req, res) {
	const log = new Log(req)	

	// Checking if all the required params are correct
	if (!req.params.page || req.params.page.trim() === '') {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	let data = {}
	const page = req.params.page

	// @ if the authorization token is valid
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

	// Getting popular users
	try {
		let userList = []
		const users = await getPopularUsers(page, 8)
		let usersIds = users.map( user => user._id )
		log.info('Got popular users')

		if ( data.id !== '' ) { //If the user is logged in
			// Getting the logged in user followings ids from the users ids
			const relations = await getAllRelations(data, usersIds)
			let followingsIds = relations.map( item => item.following._id )
			log.info('Got relations')

			// Checking if the user is following the followers
			users.forEach( user => {
				let following = false
				if ( followingsIds.filter( followingsId => followingsId.toString() === user._id.toString() ).length > 0 ) {
					following = true
				}
				userList.push({
		      id: user._id,
		      username: user.username,
		      profileUrl: user.profileUrl,
		      isFollowedByUser: following
				})
			})
		}else { //The user is not logged in
			users.forEach( user => {
				userList.push({
		      id: user._id,
		      username: user.username,
		      profileUrl: user.profileUrl,
		      isFollowedByUser: false
				})
			})
		}

		res.json(userList)
		log.info("Users found")
	}catch(err){
		res.sendStatus(500)
		log.error(err)
		return
	}

}

module.exports = userPopular