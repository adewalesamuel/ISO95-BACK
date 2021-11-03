/**
 * Post list user middleware
 * Author: samueladewale
*/

const { getUserPosts } = require('./../services/post')
const { getLikedPostsId } = require('./../services/likedPost')
const { getAllFavoritePostsWithIds } = require('./../services/favoritePost')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Display a user post list
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function postListUser(req, res) {
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

		// If the user is not logged in
		if (data.id === 'null' || !data.id) {
			// Getting the user posts
			const userPosts = await getUserPosts(data, page, 18) 
			userPosts.forEach( (userPost, index) => {
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
							isLikedByUser: false,
							isUserFavorite: false
						})
			})
		}else{// User is logged in
			// Getting the user post
			const userPosts = await getUserPosts(data, page, 18) 
			let ids = userPosts.map( item => item._id )
			log.info('Got user posts ids')

			// Getting user liked posts ids  by the logged in user 
			const userLikedPosts = await getLikedPostsId(data, ids)
			let likedPostIds = userLikedPosts.map( item => item.post._id )
			log.info('Got user liked posts')

			// Getting the user favorite posts ids beetween the user posts
			const favoritePosts = await getAllFavoritePostsWithIds(data, ids)
			let favoritePostsIds = favoritePosts.map( item => item.post._id )
			log.info('Got user favorite posts')

			// Checking if the user post has been liked by the user
			userPosts.forEach( (userPost, index) => {
				let likedPost = false
				let favorite = false
				// Checking if the post has been liked by the user
				if ( likedPostIds.filter( likedPostId => likedPostId.toString() === userPost._id.toString() ).length > 0 ) {
					likedPost = true
				}
				// Chekcing if the post is one of the user favorite
				if ( favoritePostsIds.filter( favoritePostsId => favoritePostsId.toString() === userPost._id.toString() ).length > 0 ) {
					favorite = true
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
					isLikedByUser: likedPost,
					isUserFavorite: favorite
				})
					
			} )
			log.info("Mapped user posts with liked post")
		}

		res.json(postList)
		log.info("Got user posts")
	}catch(err) {
		log.error(err)
		return
	}

}

module.exports = postListUser