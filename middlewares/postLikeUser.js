/**
 * Post likes list middleware
 * Author: samueladewale
*/

const { getLikedPostUsers } = require('./../services/likedPost')
const { getAllFollowingsById } = require('./../services/relation')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Display a list of users that liked a post
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function postLikeUser(req, res) {
	const log = new Log(req)

	// Checking if all the required params are correct
	if ( !req.params.page || !req.params.page.trim() === '' ||
		!req.body.postId || req.body.postId.trim() === '') {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	let data = req.body
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

		data.id = tokenPayload.id // The id of the logged in user 

	}catch(err) {
		res.sendStatus(500)
		log.error(err)
		return
	}

	// Gettings the users list
	try {
		let userList = []

		// Getting the users that liked a post
		const postLikeUsers = await getLikedPostUsers(data, page) 
		let usersIds = postLikeUsers.map( item => item.user._id )
		log.info('Got users ids')

		// Getting the user followings from the likers
		const followedUsers = await getAllFollowingsById(data)
		let followingsIds = followedUsers.map( item => item.following._id )
		log.info('Got followed users')

		// Checking if the user is following the users that liked the post
		postLikeUsers.forEach( (postLikeUser, index) => {
			if ( followingsIds.filter( followingsId => followingsId.toString() === postLikeUser.user._id.toString() ).length > 0 ) {
				// Following users
				userList.push({
					user: {
					    id: postLikeUser.user._id,
					    username: postLikeUser.user.username,
					    profileUrl: postLikeUser.user.profileUrl
					},
					isFollowedByUser: true
				})
			}else {
				// Not following users
				userList.push({
					user: {
					    id: postLikeUser.user._id,
					    username: postLikeUser.user.username,
					    profileUrl: postLikeUser.user.profileUrl
					},
					isFollowedByUser: false
				})
			}
		} )
		log.info("Mapped user with followings")

		res.json(userList)
		log.info("Got user posts")
	}catch(err) {
		res.sendStatus(500)
		log.error(err)
	}

}

module.exports = postLikeUser