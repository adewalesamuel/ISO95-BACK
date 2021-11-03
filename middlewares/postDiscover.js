/**
 * Post discover middleware
 * Author: samueladewale
*/

const { getDiscoverPosts, getBestPosts } = require('./../services/post')
const { getUserLikedPosts, getLikedPostsId } = require('./../services/likedPost')
const { getFavoritePosts, getAllFavoritePostsWithIds } = require('./../services/favoritePost')
const { getUserPostViews } = require('./../services/postView')
const { getAllRelations } = require('./../services/relation')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Displays a list of recommended post according to the user activties
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function postDiscover(req, res) {
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
			data.id = ''
			log.error('Token is not valid')
		}else {
			data.id = tokenPayload.id // the id of the logged in user
		}

	}catch(err) {
		data.id = ''
		log.info('No token')
	}

	// Getting user activity
	try {
		let bestPosts
		let postList = []
		let discoverPostsIds = []
		let discoverPostsUserIds = []
		let bestPostsIds = []
		let bestPostsUserIds = []

		// If the user is logged in
		if (data.id && data.id !== '') {
			data.tags = []
			data.country = []
			data.city = []

			// Getting the user liked, viewed and favorite posts infos
			const activity = await Promise.all([
				getUserLikedPosts(data),
				getFavoritePosts(data),
				getUserPostViews(data)])
			log.info('Got user activities')

			// Gettings the city, country and tags of liked posts
			activity[0].forEach( userLikedPost => {
				data.country.push(userLikedPost.post.place.country)
				data.city.push(userLikedPost.post.place.city)
				if (userLikedPost.post.tags.length > 0)
				userLikedPost.post.tags.forEach( tag => data.tags.push(tag) )
			})

			// Gettings the city, country and tags of favorite posts
			activity[1].forEach( favoritePost => {
				data.country.push(favoritePost.post.place.country)
				data.city.push(favoritePost.post.place.city)
				if (favoritePost.post.tags.length > 0)
				favoritePost.post.tags.forEach( tag => data.tags.push(tag) )
			})

			// Gettings the city, country and tags of viewed posts
			activity[2].forEach( postView => {
				data.country.push(postView.post.place.country)
				data.city.push(postView.post.place.city)
				if (postView.post.tags.length > 0)
				postView.post.tags.forEach( tag => data.tags.push(tag) )
			})

			// Getting a list of recommended post for the user
			let discoverPosts = await getDiscoverPosts(data, page, 18)

			if (discoverPosts.length < 1) discoverPosts =  await getBestPosts(page, 18)
			
			discoverPosts.forEach( discoverPost => {
				discoverPostsIds.push(discoverPost._id)
				discoverPostsUserIds.push(discoverPost.user._id)
			} )
			log.info('Got discover posts')

			// Getting the ids of the recommended post liked by the user
			const userLikedPosts = await getLikedPostsId(data, discoverPostsIds)
			let userLikedPostsIds = userLikedPosts.map( userLikedPost => userLikedPost.post._id )
			log.info('Got user liked posts')

			discoverPosts.forEach( (discoverPost, index) => {
					let postLiked = false

					if ( userLikedPostsIds.filter( likedPostId => likedPostId.toString() === discoverPost._id.toString() ).length > 0 ) {
						postLiked = true
					}

					postList.push({
						user: {
						    id: discoverPost.user._id,
						    username: discoverPost.user.username,
						    profileUrl: discoverPost.user.profileUrl,
						    // isFollowedByUser: following
						},
						thumbnail: {
							desktop: {
								size: {
									width: discoverPost.thumbnail.desktop.size.width,
									height: discoverPost.thumbnail.desktop.size.height
								},
								url: discoverPost.thumbnail.desktop.url
							},
							mobile: {
								size: {
									width: discoverPost.thumbnail.mobile.size.width, //300
									height: discoverPost.thumbnail.mobile.size.height
								},
								url: discoverPost.thumbnail.mobile.url
							}
						},
						photo: {
						    alt: discoverPost.photo.alt
						},
						id: discoverPost._id,
						publicId: discoverPost.publicId,
						likes: discoverPost.likes,
						comments: discoverPost.comments,
						time: discoverPost.time,
						isLikedByUser: postLiked,
						// isUserFavorite: favorite
					})
			} )
			log.info("Mapped discover post with liked post")
			

		}else {
			// Getting the best post if the user is not logged in
			const bestPosts = await getBestPosts(page, 18) 
			log.info('Got best posts')
			bestPosts.forEach( (bestPost, index) => {
				postList.push({
					user: {
				    id: bestPost.user._id,
				    username: bestPost.user.username,
					  profileUrl: bestPost.user.profileUrl,
					  // isFollowedByUser: false
					},
					thumbnail: {
						desktop: {
							size: {
								width: bestPost.thumbnail.desktop.size.width,
								height: bestPost.thumbnail.desktop.size.height
							},
							url: bestPost.thumbnail.desktop.url
						},
						mobile: {
							size: {
								width: bestPost.thumbnail.mobile.size.width, //300
								height: bestPost.thumbnail.mobile.size.height
							},
							url: bestPost.thumbnail.mobile.url
						}
					},
					photo: {
					    alt: bestPost.photo.alt
					},
					id: bestPost._id,
					publicId: bestPost.publicId,
					likes: bestPost.likes,
					comments: bestPost.comments,
					time: bestPost.time,
					isLikedByUser: false,
					// isUserFavorite: false
				})
			})
		}

		res.json(postList)
		log.info("Got dicover post list")
	}catch(err) {
		res.sendStatus(500)
		log.error(err)
	}

}

module.exports = postDiscover