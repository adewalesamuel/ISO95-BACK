const express = require('express')
const router = express.Router()
const postLikeUser = require('./../middlewares/postLikeUser')

router.post('/:page', postLikeUser)

module.exports = router