/**
 * Post display user feed info middleware
 * Author: samueladewale
*/

const { getUsersPosts } = require('./../services/post')
const { getLikedPostsId } = require('./../services/likedPost')
const { getAllFavoritePostsWithIds } = require('./../services/favoritePost')
const { getAllFollowingsById, getAllRelations } = require('./../services/relation')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Display a user post feed
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function postFeedUser(req, res) {
	const log = new Log(req)

	// Checking if all the required params are correct
	if ( !req.params.page || !req.params.page.trim() === '' ) {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	let data = {}
	const page = req.params.page

	// Checking if the authorization token is valid
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

	// Gettings the user feed
	try {
		let postFeed = []

		// Getting the users followings ids
		const followings = await getAllFollowingsById(data) 
		let ids = followings.map( item => item.following._id )
		ids.push(data.id)
		log.info('Got followings ids')

		// Getting the followings post
		const followingsPosts = await getUsersPosts(ids, page)
		let followingsPostsIds = followingsPosts.map( item => item._id )
		log.info('Got follings posts ids')

		// Getting the liked followings post ids from de followings post
		const likedFollowingsPosts = await getLikedPostsId(data, followingsPostsIds)
		let userLikedPostsIds = likedFollowingsPosts.map( item => item.post._id )
		log.info('Got liked post ids')

		// Getting the user favorite posts ids from the followings posts
		const favoritePosts = await getAllFavoritePostsWithIds(data, followingsPostsIds)
		let favoritePostsIds = favoritePosts.map( item => item.post._id )
		log.info('Got user favorite posts')

		followingsPosts.forEach( (followingPost, index) => {
			let postLiked = false
			let favorite = false
			// Checking if the post has been liked by the user
			if ( userLikedPostsIds.filter( likedPostId => likedPostId.toString() === followingPost._id.toString() ).length > 0 ) {
				postLiked = true
			}
			// Chekcing if the post is one of the user favorite
			if ( favoritePostsIds.filter( favoritePostsId => favoritePostsId.toString() === followingPost._id.toString() ).length > 0 ) {
				favorite = true
			}
			postFeed.push({
				user: {
				    id: followingPost.user._id,
				    username: followingPost.user.username,
				    profileUrl: followingPost.user.profileUrl,
				},
				photo: {
				    desktop: {
				        quality: {
				            medium: {
				                size: {
				                    width: followingPost.photo.desktop.quality.medium.size.width,
				                    height: followingPost.photo.desktop.quality.medium.size.height
				                },
				                url: followingPost.photo.desktop.quality.medium.url
				            }
				        }
				    },
				    mobile: {
				        size: {
				            width: followingPost.photo.mobile.size.width,
				            height: followingPost.photo.mobile.size.height
				        },
				        url: followingPost.photo.mobile.url
				    },
				    alt: followingPost.photo.alt
				},
				id: followingPost._id,
				publicId: followingPost.publicId,
				likes: followingPost.likes,
				comments: followingPost.comments,
				time: followingPost.time,
				isLikedByUser: postLiked,
				isUserFavorite: favorite
			})
		} )
		log.info("Mapped followings posts with liked post")

		res.json(postFeed)
		log.info("Got post feed")
	}catch(err) {
		res.sendStatus(500)
		log.error(err)
	}

}

module.exports = postFeedUser