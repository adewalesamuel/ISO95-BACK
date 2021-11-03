/**
 * Loging module
 * Author: samueladewale
*/

/**
 * Logs request on the console
 *
 * @class
 * @param{Request} req the request object
*/
const Log = function(req) {
	this.req = req
}

/**
 * Logs error 
 *
 * @method
 * @param{String} msg the error message
*/
Log.prototype.error = function(msg='') {
	return  console.log(`[${new Date().toUTCString()}]`,'ERROR :', this.req.method, this.req.path, this.req.ip, msg)
}

/**
 * Logs info 
 *
 * @method
 * @param{String} msg the error message
*/
Log.prototype.info = function(msg='') {
	return  console.log(`[${new Date().toUTCString()}]`,'INFO :', this.req.method, this.req.path, this.req.ip, msg)
}

/**
 * Logs warning 
 *
 * @method
 * @param{String} msg the error message
*/
Log.prototype.warning = function(msg='') {
	return  console.log(`[${new Date().toUTCString()}]`,'WARNING :', this.req.method, this.req.path, this.req.ip, msg)
}

module.exports = Log