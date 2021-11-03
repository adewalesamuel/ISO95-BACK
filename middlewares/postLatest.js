/**
 * Post latest info middleware
 * Author: samueladewale
*/

const { getLatestPost } = require('./../services/post')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Display the lastest post
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function postLatest(req, res) {
	const log = new Log(req)	

	// Checking if all the required params are correct
	if ( !req.body.time || !req.body.time === '' ) {
		res.sendStatus(400)
		log.error("The fields are not correct")
		return
	}

	let data = req.body // portrait or else

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

	// Getting the latest post
	try {
		const post = await getLatestPost(data) 
		res.json(post)
		log.info("Got latest post")
	}catch(err) {
		res.sendStatus(500)
		log.error(err)
	}

}

module.exports = postLatest