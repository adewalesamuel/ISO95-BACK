const express = require('express')
const router = express.Router()
const messageSending = require('./../middlewares/messageSending')
const messageListUser = require('./../middlewares/messageListUser')
const messageViewUpdate = require('./../middlewares/messageViewUpdate')
const messageChat = require('./../middlewares/messageChat')

router.post('', messageSending)
router.put('/view', messageViewUpdate)
router.get('', messageListUser)
router.post('/chat', messageChat)

module.exports = router