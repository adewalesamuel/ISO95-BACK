/**
 * Post list favorite middleware
 * Author: samueladewale
*/

const { getPostsByIds } = require('./../services/post')
const { getUserFavoritePostsId } = require('./../services/favoritePost')
const { getLikedPostsId } = require('./../services/likedPost')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Display a user post list
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function postListFavorite(req, res) {
	const log = new Log(req)

	// Checking if all the required params are correct
	if ( !req.params.page || !req.params.page.trim() === '' ||
		!req.params.username || req.params.username.trim() === '') {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	let data = {}
	const page = req.params.page
	data.username = req.params.username

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

	// Gettings the users posts
	try {
		let postList = []

		// Getting the user favorite post ids
		const favoritePosts = await getUserFavoritePostsId(data, page, 18)
		let favoritePostIds = favoritePosts.map( item => item.post._id )
		log.info('Got favorite posts ids')

		// Getting the posts from the favorite post
  	const usersPosts = await getPostsByIds(favoritePostIds) 
		let userPostIds = usersPosts.map( item => item._id )
		log.info('Got user posts ids')

		// Getting the liked favorite posts
		const userLikedPosts = await getLikedPostsId(data, userPostIds)
		let likedPostIds = userLikedPosts.map( item => item.post._id )
		console.log(likedPostIds)
		log.info('Got user liked posts')

		// Checking if the posts are liked by the user
		usersPosts.forEach( (userPost, index) => {
			let postLiked = false
			// Chekcing if the post has been liked by the user
			if ( likedPostIds.filter( likedPostId => likedPostId.toString() === userPost._id.toString() ).length > 0 ) {
				postLiked = true
			}
			postList.push({
				user: {
				    id: userPost.user._id,
				    username: userPost.user.username,
				    profileUrl: userPost.user.profileUrl
				},
				thumbnail: {
					desktop: {
						size: {
							width: userPost.thumbnail.desktop.size.width,
							height: userPost.thumbnail.desktop.size.height
						},
						url: userPost.thumbnail.desktop.url
					},
					mobile: {
						size: {
							width: userPost.thumbnail.mobile.size.width, //300
							height: userPost.thumbnail.mobile.size.height
						},
						url: userPost.thumbnail.mobile.url
					}
				},
				photo: {
				    mobile: {
				        size: {
				            width: userPost.photo.mobile.size.width,
				            height: userPost.photo.mobile.size.height
				        },
				        url: userPost.photo.mobile.url
				    },
				    alt: userPost.photo.alt
				},
				id: userPost._id,
				publicId: userPost.publicId,
				likes: userPost.likes,
				comments: userPost.comments,
				time: userPost.time,
				isLikedByUser: postLiked,
				isFavoritePost: true
			})
		} )
		log.info("Mapped user posts with liked post")

		res.json(postList)
		log.info("Got user posts")
	}catch(err) {
		res.sendStatus(500)
		log.error(err)
		return
	}

}

module.exports = postListFavorite