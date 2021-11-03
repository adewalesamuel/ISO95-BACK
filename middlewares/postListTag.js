/**
 * Post list tags middleware
 * Author: samueladewale
*/

const { getPostsByTags } = require('./../services/post')
const { getLikedPostsId } = require('./../services/likedPost')
const { getAllFavoritePostsWithIds } = require('./../services/favoritePost')
const { getAllRelations } = require('./../services/relation')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Displays posts according to the tag
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function postListTags(req, res) {
	const log = new Log(req)

	// Checking if all the required params and body fields are correct
	if ( !req.params.page || !req.params.page.trim() === '' || !req.body.tags ) {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	let data = req.body
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

	// Gettings the tag posts
	try {
		let postList = []

		// Getting the posts by tags
		const tagPosts = await getPostsByTags(data, page, 18) 

		// If the user is logged in
		if (data.id || data.id !== '') {
			let tagPostsIds = []
			let tagPostsUserIds = []
			tagPosts.forEach( item => {
				tagPostsIds.push(item._id )
				tagPostsUserIds.push(item.user._id)
			})
			log.info('Got user posts ids')

			// Getting user liked posts ids  by the logged in user 
			const userLikedPosts = await getLikedPostsId(data, tagPostsIds)
			let likedPostIds = userLikedPosts.map( item => item.post._id )
			log.info('Got user liked posts')

			// Getting the user followings ids from the tag posts owners
			const relations = await getAllRelations(data, tagPostsUserIds)
			let follwingsIds = relations.map( item => item.following._id )
			log.info('Got followed users')

			// Getting the user favorite posts ids from the tag posts
			const favoritePosts = await getAllFavoritePostsWithIds(data, tagPostsIds)
			let favoritePostsIds = favoritePosts.map( item => item.post._id )
			log.info('Got user favorite posts')

			// Checking if the tag post has been liked by the user
			tagPosts.forEach( (tagPost, index) => {
				let likedPost = false
				let favorite = false
				let following = false
				// Checking if the post has been liked by the user
				if ( likedPostIds.filter( likedPostId => likedPostId.toString() === tagPost._id.toString() ).length > 0 ) {
					likedPost = true
				}
				// Checking if the post owner is followed by the user
				if ( follwingsIds.filter( follwingsId => follwingsId.toString() === tagPost.user._id.toString() ).length > 0 ) {
					following = true
				}
				// Chekcing if the post is one of the user favorite
				if ( favoritePostsIds.filter( favoritePostsId => favoritePostsId.toString() === tagPost._id.toString() ).length > 0 ) {
					favorite = true
				}
				postList.push({
					user: {
					    id: tagPost.user._id,
					    username: tagPost.user.username,
					    profileUrl: tagPost.user.profileUrl,
					    isFollowedByUser: following
					},
					thumbnail: {
						desktop: {
							size: {
								width: tagPost.thumbnail.desktop.size.width,
								height: tagPost.thumbnail.desktop.size.height
							},
							url: tagPost.thumbnail.desktop.url
						},
						mobile: {
							size: {
								width: tagPost.thumbnail.mobile.size.width, //300
								height: tagPost.thumbnail.mobile.size.height
							},
							url: tagPost.thumbnail.mobile.url
						}
					},
					photo: {
				    mobile: {
			        size: {
		            width: tagPost.photo.mobile.size.width,
		            height: tagPost.photo.mobile.size.height
			        },
			        url: tagPost.photo.mobile.url
				    },
				    alt: tagPost.photo.alt
					},
					id: tagPost._id,
					publicId: tagPost.publicId,
					likes: tagPost.likes,
					comments: tagPost.comments,
					time: tagPost.time,
					isLikedByUser: likedPost,
					isUserFavorite: favorite
				})
					
			} )

		}else{
			// If the user is not logged in
			tagPosts.forEach( (tagPost, index) => {
				postList.push({
					user: {
					    id: tagPost.user._id,
					    username: tagPost.user.username,
					    profileUrl: tagPost.user.profileUrl,
					    isFollowedByUser: false 
					},
					thumbnail: {
						desktop: {
							size: {
								width: tagPost.thumbnail.desktop.size.width,
								height: tagPost.thumbnail.desktop.size.height
							},
							url: tagPost.thumbnail.desktop.url
						},
						mobile: {
							size: {
								width: tagPost.thumbnail.mobile.size.width, //300
								height: tagPost.thumbnail.mobile.size.height
							},
							url: tagPost.thumbnail.mobile.url
						}
					},
					photo: {
				    mobile: {
			        size: {
		            width: tagPost.photo.mobile.size.width,
		            height: tagPost.photo.mobile.size.height
			        },
			        url: tagPost.photo.mobile.url
				    },
				    alt: tagPost.photo.alt
					},
					id: tagPost._id,
					publicId: tagPost.publicId,
					likes: tagPost.likes,
					comments: tagPost.comments,
					time: tagPost.time,
					isLikedByUser: false,
					isUserFavorite: false
				})
					
			} )

		}

		log.info("Mapped user posts with liked post")

		res.json(postList)
		log.info("Got user posts")
	}catch(err) {
		log.error(err)
		return
	}

}

module.exports = postListTags