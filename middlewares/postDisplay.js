/**
 * Post display info middleware
 * Author: samueladewale
*/

const { getPostById } = require('./../services/post')
const { getUserLikedPost } = require('./../services/likedPost')
const { getRelation } = require('./../services/relation')
const { getUserFavoritePost } = require('./../services/favoritePost')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Display a post by its public id
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function postDisplay(req, res) {
	const log = new Log(req)	

	// Checking if all the required params are correct
	if ( !req.params.publicId || !req.params.publicId.trim() === '' ) {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	let data = req.params // portrait or else

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

	// Getting a post
	try {
		let postLiked = false
		let favorite  = false
		let following = false
		let isUser = false
		let postData = {}
		
		const post = await getPostById(data) 
		data.postId = post._id

		if ( !post ) {
			res.sendStatus(404)
			log.error("The post does not exist")
			return
		}

		// If user is logged in
		if (data.id && data.id !== '') {
			// Getting the the post liked by the user from the post id
			const userLikedPost = await getUserLikedPost(data)
			log.info('Got user liked post')

			// Getting the user following id from the post owner id
			let userFollowing = {id:post.user._id}
			const relation = await getRelation(data, userFollowing)
			log.info('Got followed user')

			// Getting the user favorite post from post id
			const favoritePost = await getUserFavoritePost(data)
			log.info('Got user favorite post')

			if (userLikedPost) postLiked = true
			if (relation) following = true
			if (favoritePost) favorite = true
			if (data.id.toString() == post.user._id.toString()) isUser = true

			postData = {
				user: {
				    id: post.user._id,
				    username: post.user.username,
				    profileUrl: post.user.profileUrl,
				    isFollowedByUser: following
				},
				photo: {
	        desktop: {
	            quality: {
	                high: {
	                    size: {
	                        width: post.photo.desktop.quality.high.size.width,
	                        height: post.photo.desktop.quality.high.size.height
	                    },
	                    url: post.photo.desktop.quality.high.url
	                }
	            }
	        },
	        mobile: {
	            size: {
	                width: post.photo.mobile.size.width,
	                height: post.photo.mobile.size.height
	            },
	            url: post.photo.mobile.url
	        },
        alt: post.photo.alt
    		},
				id: post._id,
				publicId: post.publicId,
				likes: post.likes,
				comments: post.comments,
				time: post.time,
				caption: post.caption,
				place: {
					city: post.place.city,
					country: post.place.country
				},
				camera: {
					name: post.camera.name,
					shutterSpeed: post.camera.shutterSpeed,
					focalLength: post.camera.focalLength,
					iso: post.camera.iso,
					aperture: post.camera.aperture
				},
				tags: post.tags,
				isLikedByUser: postLiked,
				isUserFavorite: favorite,
				isUser: isUser
			}

		}else {// User not logged in
			postData = {
				user: {
				    id: post.user._id,
				    username: post.user.username,
				    profileUrl: post.user.profileUrl,
				    isFollowedByUser: following
				},
				photo: {
        desktop: {
            quality: {
                high: {
                    size: {
                        width: post.photo.desktop.quality.high.size.width,
                        height: post.photo.desktop.quality.high.size.height
                    },
                    url: post.photo.desktop.quality.high.url
                }
            }
        },
        mobile: {
            size: {
                width: post.photo.mobile.size.width,
                height: post.photo.mobile.size.height
            },
            url: post.photo.mobile.url
        },
        alt: post.photo.alt
    		},
				id: post._id,
				publicId: post.publicId,
				likes: post.likes,
				comments: post.comments,
				time: post.time,
				caption: post.caption,
				place: {
					city: post.place.city,
					country: post.place.country
				},
				camera: {
					name: post.camera.name,
					shutterSpeed: post.camera.shutterSpeed,
					focalLength: post.camera.focalLength,
					iso: post.camera.iso,
					aperture: post.camera.aperture
				},
				tags: post.tags,
				isLikedByUser: postLiked,
				isUserFavorite: favorite
			}
		}

		res.json(postData)
		log.info("Got post")
	}catch(err) {
		res.sendStatus(500)
		log.error(err)
	}

}

module.exports = postDisplay