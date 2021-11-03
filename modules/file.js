/*
 * File upload
 * Author: samuel adewale
**/
const formidable = require('formidable')
const sharp = require('sharp')
const { unlinkSync } = require('fs')
const { baseDir } = require('./../environement') 
const sizeOf = require('image-size');

/**
 * Uploads an image
 *
 * @param{Request} req the request object
 * @param{String} folder the folder where the image should be uploaded
 * @return{Promise}
*/
const uploadImage = (req, folder) => {
	return new Promise( (resolve, reject) => {
		const form = new formidable.IncomingForm();

		form.parse(req);
		form.on('fileBegin', function (name, file){
		    file.path = `${baseDir}/${folder}/` + file.name
		});
		form.on('file', function (name, file){
		    console.log('Uploaded ' + file.path)
		    resolve(file.path)
		});

	} )
}

/**
 * Resize an image
 *
 * @param{String} oldFilePath the path of the image to resize
 * @param{String} filepath the path of the resized file
 * @param{Number} width the width of the resized image
 * @param{Number} heigh the height of the resized image
 * @return{Promise}
*/
const resizeImage = (oldFilePath, filepath, width, height=null) => {
	return new Promise( (resolve, reject) => {
		sharp(oldFilePath).resize(width, height).toFile(`${baseDir}/${filepath}`, function(err) {
	    if (err) { reject(err) } else { resolve() }
				});
	} )
}

/**
 * Deletes an image
 *
 * @param{String} filepath the path of the image to delete
 * @return{Function}
*/
const deleteImage = filepath => {
	return unlinkSync(filepath)
}

/**
 * Deletes an image
 *
 * @param{String} filepath the path of the image to delete
 * @return{Function}
*/
const deletePostPicture = (filepath) => {
	return unlinkSync(`${baseDir}/${filepath}`)
}

/**
 * Gets an image size
 *
 * @param{String} filepath the path of the image to get
 * @return{Function}
*/
const getImageSize = (filepath) => {
	return sizeOf(`${baseDir}/${filepath}`)
}

const getFileNameFromUrl = url => {
	return url.split('/')[url.split('/').length - 1]
}

module.exports = {
	uploadImage,
	resizeImage,
	deleteImage,
	getImageSize,
	deletePostPicture,
	getFileNameFromUrl
}
