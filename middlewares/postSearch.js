/**
 * Post list shearch middleware
 * Author: samueladewale
*/

const { getPostBySearchQuery } = require('./../services/post')
const { getLikedPostsId } = require('./../services/likedPost')
const { getAllFavoritePostsWithIds } = require('./../services/favoritePost')
const { getAllRelations } = require('./../services/relation')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Displays posts according to the search query
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function postSearch(req, res) {
	const log = new Log(req)

	// Checking if all the required params are correct
	if ( !req.query.page || !req.query.page.trim() === '' ||
		!req.query.q || req.query.q.trim() === '') {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	let data = req.query
	const page = req.query.page

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

	// Gettings the user posts
	try {
		let postList = []

		// Getting the posts by query search
		const queryPosts = await getPostBySearchQuery(data, page, 18) 

		// If the user is logged in
		if (data.id || data.id !== '') {
			let queryPostsIds = []
			let queryPostsUserIds = []

			// Getting the users and posts ids
			queryPosts.forEach( item => {
				queryPostsIds.push(item._id )
				queryPostsUserIds.push(item.user._id)
			})
			log.info('Got users and posts ids')

			// Getting user liked posts ids  by the logged in user 
			const userLikedPosts = await getLikedPostsId(data, queryPostsIds)
			let likedPostIds = userLikedPosts.map( item => item.post._id )
			log.info('Got user liked posts')

			// Checking if the user post has been liked by the user
			queryPosts.forEach( (queryPost, index) => {
				let likedPost = false

				// Checking if the post has been liked by the user
				if ( likedPostIds.filter( likedPostId => likedPostId.toString() === queryPost._id.toString() ).length > 0 ) {
					likedPost = true
				}
			
				postList.push({
					user: {
					    id: queryPost.user._id,
					    username: queryPost.user.username,
					    profileUrl: queryPost.user.profileUrl,
					},
					photo: {
						alt: queryPost.photo.alt
					},
					thumbnail: {
						desktop: {
							size: {
								width: queryPost.thumbnail.desktop.size.width,
								height: queryPost.thumbnail.desktop.size.height
							},
							url: queryPost.thumbnail.desktop.url
						},
						mobile: {
							size: {
								width: queryPost.thumbnail.mobile.size.width, //300
								height: queryPost.thumbnail.mobile.size.height
							},
							url: queryPost.thumbnail.mobile.url
						}
					},
					id: queryPost._id,
					publicId: queryPost.publicId,
					likes: queryPost.likes,
					comments: queryPost.comments,
					time: queryPost.time,
					isLikedByUser: likedPost,
				})
					
			} )

		}else{
			// If the user is not logged in
			queryPosts.forEach( (queryPost, index) => {
				postList.push({
					user: {
					    id: queryPost.user._id,
					    username: queryPost.user.username,
					    profileUrl: queryPost.user.profileUrl
					},
					photo: {
						alt: queryPost.photo.alt
					},
					thumbnail: {
						desktop: {
							size: {
								width: queryPost.thumbnail.desktop.size.width,
								height: queryPost.thumbnail.desktop.size.height
							},
							url: queryPost.thumbnail.desktop.url
						},
						mobile: {
							size: {
								width: queryPost.thumbnail.mobile.size.width, //300
								height: queryPost.thumbnail.mobile.size.height
							},
							url: queryPost.thumbnail.mobile.url
						}
					},
					id: queryPost._id,
					publicId: queryPost.publicId,
					likes: queryPost.likes,
					comments: queryPost.comments,
					time: queryPost.time
				})
					
			} )

		}

		log.info("Mapped user posts with liked post")

		res.json(postList)
		log.info("Got user posts")
	}catch(err) {
		res.sendStatus(500)
		log.error(err)
	}

}

module.exports = postSearch