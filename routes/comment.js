const express = require('express')
const router = express.Router()
const commentRegistration = require('./../middlewares/commentRegistration')
const commentListPost = require('./../middlewares/commentListPost')
const commentLike = require('./../middlewares/commentLike')
const commentDeletion = require('./../middlewares/commentDeletion')

router.get('/:postId/:page', commentListPost)
router.post('/like', commentLike)
router.post('', commentRegistration)
router.delete('', commentDeletion)

module.exports = router