/**
 * Message list user middleware
 * Author: samueladewale
*/
const { getUserMessages } = require('./../services/message')
const { getAuthorizationBearerToken, isValidToken, getTokenPayload } = require('./../modules/authentication')
const Log = require('./../modules/logging')

/**
 * Displays a user received messages
 *
 * @param{Request} req the request object
 * @param{Response} res the response object
*/
async function messageListUser(req, res) {
	const log = new Log(req)	

	let data = {}
	
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

	// Getting the user messages
	try {
		let messageList = []

		const userMessages = await getUserMessages(data)
		log.info("Got user messages")

		userMessages.forEach( userMessage => {
			let hasMessage = false

			if ( messageList.length > 0 ) {
				messageList.forEach( message => {
					if ( message.sender._id.toString() === userMessage.sender._id.toString() ) {
						if ( !userMessage.isViewed ) message.msgNum += 1
						hasMessage = true
					}
				} )
			}

			if (!hasMessage) {
				messageList.push({
					 	sender: {
							id: userMessage.sender._id,
							username: userMessage.sender.username,
							profileUrl: userMessage.sender.profileUrl
						},
						receiver: {
							id: userMessage.receiver._id,
						},
						time: userMessage.time,
						message: userMessage.message,
						isViewed: userMessage.isViewed,
						msgNum: 1
					})
			}
		} )

		res.json(messageList)
	}catch(err) {
		res.sendStatus(500)
		log.error(err)
		return
	}

}

module.exports = messageListUser