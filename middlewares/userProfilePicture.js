/**
 * User profile picture middleware
 * Author: samueladewale
*/

const { updateUserProfileUrl, getUserWithId } = require('./../services/user')
const { updateLikedPostProfileUrl } = require('./../services/likedPost')
const { updatePostProfileUrl } = require('./../services/post')
const { updateCommentUserProfileUrl } = require('./../services/comment')
const { updateFollowingProfileUrl, updateFollowerProfileUrl } = require('./../services/relation')
const { updatePostViewProfileUrl } = require('./../services/postView')
const { updateNotificationUserProfileUrl } = require('./../services/notification')
const { updateMessageUserProfileUrl } = require('./../services/message')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const { uploadImage, resizeImage, deleteImage } = require('./../modules/file')
const Log = require('./../modules/logging')

/**
 * Updates the connected users info
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function userProfilePicture(req, res) {
	const log = new Log(req)	
	log.info('userProfilePicture')

	let data = {}
	let user
	const profilePicPath = 'uploads/profiles'

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

	// Checking if there is a profile picture
	try {
		user = await getUserWithId(data)
		
		if ( user.profileUrl !== '' || user.profileUrl.trim() !== '') {
			// Getting the filename of the existing profile picture from the profile picture url
			data.filename = user.profileUrl.split('/')[user.profileUrl.split('/').length - 1]
			log.info('Profile picture exists')
		}else {
			// Generating a random filename for the profile picture
			data.filename = `${user.username}-${Math.round(new Date().getTime() * (Math.random() * 1000))}.jpg`
			log.info('Profile picture doesnt exist')
		}
	}catch(err) {
		res.sendStatus(500)
		log.error(err)
		return
	}

	// Uploading users profile picture
	try {
		const uploadedImage = await uploadImage(req, profilePicPath, data.filename)
		log.info("Uploaded Image" + uploadedImage)

		// Resizing the profile picture to 200x200
		const hasResizedImage = await resizeImage(uploadedImage, `${profilePicPath}/${data.filename}`, 200, 200)
		log.info("Resized image" + `${profilePicPath}/${data.filename}`)

		// Updating the user profile url
		await Promise.all([
			updateUserProfileUrl(data),
			updatePostProfileUrl(data),
			updateFollowerProfileUrl(data),
			updateFollowingProfileUrl(data),
			updateLikedPostProfileUrl(data),
			updatePostViewProfileUrl(data),
			updateCommentUserProfileUrl(data),
			updateNotificationUserProfileUrl(data),
			updateMessageUserProfileUrl(data)
			])
		log.info("Profile pic updated")
		
		deleteImage(uploadedImage)
		res.sendStatus(200)

		log.info("Image deleted")
	}catch(err){
		res.sendStatus(500)
		log.error(err)
	}

}

module.exports = userProfilePicture