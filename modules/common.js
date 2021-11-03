/**
 * Common module
 * Author: samuel adewale
*/

/**
 * Generates a random id
 *
 * @param{Number} length the length of the random id
*/
const generateRandomId = (length=13) => {
	const letters = 'aqwzsxedcrfvtgbyhnujikolpmNBVCXWMQLSKDJFHGEZAPOIRTYU'
	let randomId = []
	let randomletter
	for (let i=0; i < length; i++) {
		randomletter = letters[Math.round( ( Math.random() * (letters.length) - 1) )]
		randomId.push(randomletter)
	}

	return randomId.join('')
}

module.exports = {
	generateRandomId
}