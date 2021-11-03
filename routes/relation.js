const express = require('express')
const router = express.Router()
const relationFollow = require('./../middlewares/relationFollow')
const relationUnfollow = require('./../middlewares/relationUnfollow')
const relationFollower = require('./../middlewares/relationFollower')
const relationFollowing = require('./../middlewares/relationFollowing')

router.post('/follow', relationFollow)
router.post('/unfollow', relationUnfollow)
router.get('/followers/:username/:page', relationFollower)
router.get('/followings/:username/:page', relationFollowing)

module.exports = router