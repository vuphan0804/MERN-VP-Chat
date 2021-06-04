const router = require('express').Router()
const uploadImage = require('../middleware/uploadImage')
const uploadCtrl = require('../controller/uploadCtrl')

router.post('/upload_avatar', uploadImage, uploadCtrl.uploadAvatar)

module.exports = router