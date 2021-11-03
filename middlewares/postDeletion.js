/**
 * Post deletion middleware
 * Author: samueladewale
*/

const { decreaseUserPosts } = require('./../services/user')
const { findAndDeleteUserPost, getUserPost } = require('./../services/post')
const { removeLikedPosts } = require('./../services/likedPost')
const { removeFavoritePosts } = require('./../services/favoritePost')
const { removePostViews } = require('./../services/postView')
const { deletePostComments } = require('./../services/comment')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const { deletePostPicture, getFileNameFromUrl } = require('./../modules/file')
const Log = require('./../modules/logging')

/**
 * Deletes a post
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function postCreationPhoto(req, res) {
	const log = new Log(req)	

	// Checking if all the required params are correct
	if (!req.body.postId || req.body.postId.trim() === '') {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}
	
	let post
	let data = {}
	data.postId = req.body.postId // id of the post on the client side url
	const postPhotoPath = 'uploads/photos'

	// Checking if the authorazation token is valid
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

	// Deleting the users post
	try {
		post = await findAndDeleteUserPost(data)

		// If the user post does not exists
		if ( !post ) {
			res.sendStatus(404)
			log.error('User post not found')
			return
		}

		// Removing all occurenses of the posts
		await Promise.all([
				removeFavoritePosts(data),
				removeLikedPosts(data),
				removePostViews(data),
				deletePostComments(data)
			])

		await decreaseUserPosts(data) // Decreasing user post count

		log.info("User post decreased")  
	}catch(err){
		res.sendStatus(500)
		log.error(err)
		return
	}

	// Deleting the post pictures
	try {
		const filenames = {
			photo: {
				desktop: {
					quality: {
						medium: getFileNameFromUrl(post.photo.desktop.quality.medium.url),
						high: getFileNameFromUrl(post.photo.desktop.quality.high.url)
					}
				},
				mobile: getFileNameFromUrl(post.photo.mobile.url)
			},
			thumbnail: {
				desktop: getFileNameFromUrl(post.thumbnail.desktop.url),
				mobile: getFileNameFromUrl(post.thumbnail.mobile.url)
			}
		}

		deletePostPicture(`${postPhotoPath}/${filenames.photo.desktop.quality.medium}`)
		deletePostPicture(`${postPhotoPath}/${filenames.photo.desktop.quality.high}`)
		deletePostPicture(`${postPhotoPath}/${filenames.photo.mobile}`)
		deletePostPicture(`${postPhotoPath}/${filenames.thumbnail.desktop}`)
		deletePostPicture(`${postPhotoPath}/${filenames.thumbnail.mobile}`)
		log.info("Post pictures deleted")

		res.sendStatus(200)
		log.info('User post deleted')
	}catch(err) {
		res.sendStatus(500)
		log.error(err)
	}

}

module.exports = postCreationPhoto