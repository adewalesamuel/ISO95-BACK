/**
 * Post creation photo middleware
 * Author: samueladewale
*/

const { getUserWithId, increaseUserPosts } = require('./../services/user')
const { createPostWithPhoto } = require('./../services/post')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const { uploadImage, resizeImage, getImageSize, deleteImage } = require('./../modules/file')
const { generateRandomId } = require('./../modules/common')
const Log = require('./../modules/logging')

/**
 * Creates a post with a photo
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function postCreationPhoto(req, res) {
	const log = new Log(req)	

	// Checking if all the required params are correct
	if (!req.params.mode || req.params.mode.trim() === '') {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	if (req.params.mode !== 'landscape' && req.params.mode !== 'portrait') {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	let mode = req.params.mode // portrait or landscape
	let data = {}
	let user
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

	// Getting the logged in user
	try {
		user = await getUserWithId(data)
		data.username = user.username
		data.profileUrl = user.profileUrl
		log.info("Got user")
	}catch(err){
		res.sendStatus(500)
		log.error(err)
		return
	}

	// Generating a random filename for the photo
	data.filename = generateRandomId(23) + '.jpg'

	//Generating a random id for the post
	data.publicId = generateRandomId()

	// Uploading the post pictures
	try {
		const uploadedImage = await uploadImage(req, postPhotoPath)
		log.info("Uploaded Image" + uploadedImage)

		// Setting the picture thumnail height according to de mode(portrait/lanscape) 
		let descktopThumbnailHeight
		let mobileThumbnailHeight
		if (mode === 'landscape') {
			descktopThumbnailHeight = 305
			mobileThumbnailHeight = 223
		}else if (mode === 'portrait') {
			descktopThumbnailHeight = 610
			mobileThumbnailHeight = 447
		}

		// Resizing the post picture in differents sizes
		const resizedPhoto = await Promise.all([
			resizeImage(uploadedImage,`${postPhotoPath}/1900-${data.filename}`, 1900),//desktop high
			resizeImage(uploadedImage, `${postPhotoPath}/900-${data.filename}`, 900),// desktop medium
			resizeImage(uploadedImage, `${postPhotoPath}/554-${data.filename}`, 554),// mobile
			resizeImage(uploadedImage, `${postPhotoPath}/thumbnail544-${data.filename}`, 554, descktopThumbnailHeight),// desktop thumbnail
			resizeImage(uploadedImage, `${postPhotoPath}/thumbnail406-${data.filename}`, 406,  mobileThumbnailHeight)// mobile thumbnail
			])
		log.info("Resized image" + `${postPhotoPath}/${data.filename}`)
		
		// Deleting the original image
		deleteImage(uploadedImage)
		log.info("Image deleted")
	}catch(err){
		res.sendStatus(500)
		log.error(err)
		return
	}

	// Creating the post 
	try {
		const photo = {
			thumbnail: { // For explore, user post, search
				desktop: {
					size: {
						width: getImageSize(`${postPhotoPath}/thumbnail544-${data.filename}`).width, // 554
						height: getImageSize(`${postPhotoPath}/thumbnail544-${data.filename}`).height // 610 305
					},
					url: `${postPhotoPath}/thumbnail544-${data.filename}`
				},
				mobile: {
					size: {
						width: getImageSize(`${postPhotoPath}/thumbnail406-${data.filename}`).width, // 406
						height: getImageSize(`${postPhotoPath}/thumbnail406-${data.filename}`).height // 447 223
					},
					url: `${postPhotoPath}/thumbnail406-${data.filename}`
				}
			},
			alt: '',
			desktop: {
				quality: {
					medium: { // For feed
						size: {
							width: getImageSize(`${postPhotoPath}/900-${data.filename}`).width, //900
							height: getImageSize(`${postPhotoPath}/900-${data.filename}`).height
						},
						url: `${postPhotoPath}/900-${data.filename}`
					},
					high: { // For post
						size: {
							width: getImageSize(`${postPhotoPath}/1900-${data.filename}`).width, //1900
							height: getImageSize(`${postPhotoPath}/1900-${data.filename}`).height
						},
						url: `${postPhotoPath}/1900-${data.filename}`
					}
				}
			},
			mobile: {
				size: {
					width: getImageSize(`${postPhotoPath}/554-${data.filename}`).width, //554
					height: getImageSize(`${postPhotoPath}/554-${data.filename}`).height
				},
				url: `${postPhotoPath}/554-${data.filename}`
			}
		}

		// Registering the post with the picture
		const postCreated = await createPostWithPhoto(data, photo) 
		const postIncreased = await increaseUserPosts(data) // Inscreasing user post count
		res.json({ publicId: data.publicId})
		log.info("Photo created")
	}catch(err) {
		res.sendStatus(500)
		log.error(err)
		return
	}

}

module.exports = postCreationPhoto