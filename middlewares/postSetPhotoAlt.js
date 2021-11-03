/**
 * Post set photo alt middleware
 * Author: samueladewale
*/
const { updatePostAltByPublicId } = require('./../services/post')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Updates the post alt
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function postSetPhotoAlt(req, res) {
	const log = new Log(req)	

	// Checking if all the required params are correct
	if (!req.body.publicId || req.body.publicId.trim() === '' || 
		!req.body.alt ) {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	let data = req.body

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

	// Updating the post photo alt
	try {
		const updatedPost = await updatePostAltByPublicId(data)
		if ( updatedPost.n === 0 ) {
			res.sendStatus(404)
			log.error("User post not found")
			return
		}
		res.sendStatus(200)
		log.info("Updated post alt")
	}catch(err){
		res.sendStatus(500)
		log.error(err)
	}
}

module.exports = postSetPhotoAlt