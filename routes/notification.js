const express = require('express')
const router = express.Router()
const notificationListUser = require('./../middlewares/notificationListUser')
const notificationDeletion = require('./../middlewares/notificationDeletion')

router.get('', notificationListUser)
router.delete('', notificationDeletion)

module.exports = router