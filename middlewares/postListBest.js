/**
 * Post list best middleware
 * Author: samueladewale
*/

const { getBestWeekPosts } = require('./../services/post')
const { getLikedPostsId } = require('./../services/likedPost')
const { getAllRelations } = require('./../services/relation')
const { getAllFavoritePostsWithIds } = require('./../services/favoritePost')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Display the best posts of a period
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function postListBest(req, res) {
	const log = new Log(req)

	// Checking if all the required params are correct
	if ( !req.params.page || !req.params.page.trim() === '') {
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
			data.id = ''
			log.error('Token is not valid')
		}else {
			data.id = tokenPayload.id // the id of the logged in user
		}

	}catch(err) {
		data.id = ''
		log.info('No token')
	}

	// Gettings the users posts
	try {
		let postList = []
		const bestWeekPosts = await getBestWeekPosts(page) 

		// If the user is not logged in
		if (data.id === 'null' || !data.id) {
			// Gettings the best week posts
			bestWeekPosts.forEach( (bestWeekPost, index) => {
				postList.push({
					user: {
				    id: bestWeekPost.user._id,
				    username: bestWeekPost.user.username,
				    profileUrl: bestWeekPost.user.profileUrl,
				    isFollowedByUser: false
					},
					photo: {
				    desktop: {
				        quality: {
				            medium: {
				                size: {
				                    width: bestWeekPost.photo.desktop.quality.medium.size.width,
				                    height: bestWeekPost.photo.desktop.quality.medium.size.height
				                },
				                url: bestWeekPost.photo.desktop.quality.medium.url
				            }
				        }
				    },
				    mobile: {
				        size: {
				            width: bestWeekPost.photo.mobile.size.width,
				            height: bestWeekPost.photo.mobile.size.height
				        },
				        url: bestWeekPost.photo.mobile.url
				    },
				    alt: bestWeekPost.photo.alt
					},
					id: bestWeekPost._id,
					publicId: bestWeekPost.publicId,
					likes: bestWeekPost.likes,
					comments: bestWeekPost.comments,
					time: bestWeekPost.time,
					isLikedByUser: false,
					isUserFavorite: false
				})						
			})
		}else{// If the user is logged in
			// Gettings the best week posts
			let ids = []
			let usersIds = []
			bestWeekPosts.forEach( item => {
				ids.push(item._id)
				usersIds.push(item.user._id)
			} )
			log.info('Got users and posts ids')

			// Getting the ids of the posts liked by the user
			const userLikedPosts = await getLikedPostsId(data, ids)
			let likedPostIds = userLikedPosts.map( item => item.post._id )
			log.info('Got user liked posts')

			// Getting the user followings ids beetween the discover posts users
			const relations = await getAllRelations(data, usersIds)
			let follwingsIds = relations.map( item => item.following._id )
			log.info('Got followed users')

			// Getting the user favorite posts ids beetween the discover posts
			const favoritePosts = await getAllFavoritePostsWithIds(data, ids)
			let favoritePostsIds = favoritePosts.map( item => item.post._id )
			log.info('Got user favorite posts')

			// Checking if best weekpost liked by the user
			bestWeekPosts.forEach( (bestWeekPost, index) => {
				let postLiked = false
				let following = false
				let favorite = false

				// Chekcing if the post has been liked by the user
				if ( likedPostIds.filter( likedPostId => likedPostId.toString() === bestWeekPost._id.toString() ).length > 0 ) {
					postLiked = true
				}
				// Chekcing if the post user is followed by the user
				if ( follwingsIds.filter( follwingsId => follwingsId.toString() === bestWeekPost.user._id.toString() ).length > 0 ) {
					following = true
				}
				// Chekcing if the post is one of the user favorite
				if ( favoritePostsIds.filter( favoritePostsId => favoritePostsId.toString() === bestWeekPost._id.toString() ).length > 0 ) {
					favorite = true
				}
				postList.push({
					// User liked post
					user: {
					    id: bestWeekPost.user._id,
					    username: bestWeekPost.user.username,
					    profileUrl: bestWeekPost.user.profileUrl,
					    isFollowedByUser: following
					},
					photo: {
				    desktop: {
				        quality: {
				            medium: {
				                size: {
				                    width: bestWeekPost.photo.desktop.quality.medium.size.width,
				                    height: bestWeekPost.photo.desktop.quality.medium.size.height
				                },
				                url: bestWeekPost.photo.desktop.quality.medium.url
				            }
				        }
				    },
				    mobile: {
				        size: {
				            width: bestWeekPost.photo.mobile.size.width,
				            height: bestWeekPost.photo.mobile.size.height
				        },
				        url: bestWeekPost.photo.mobile.url
				    },
				    alt: bestWeekPost.photo.alt
					},
					id: bestWeekPost._id,
					publicId: bestWeekPost.publicId,
					likes: bestWeekPost.likes,
					comments: bestWeekPost.comments,
					time: bestWeekPost.time,
					isLikedByUser: postLiked,
					isUserFavorite: favorite
				})
			})
		}
		log.info("Mapped best week posts with liked post")
		res.json(postList)
		log.info("Got user posts")
	}catch(err) {
		res.sendStatus(500)
		log.error(err)
	}

}

module.exports = postListBest