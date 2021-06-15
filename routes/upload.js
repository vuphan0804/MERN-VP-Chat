const router = require('express').Router()
const uploadImage = require('../middleware/uploadImage')
const uploadCtrl = require('../controller/uploadCtrl')
const auth = require('../middleware/auth')

router.post('/upload_avatar', uploadImage, auth, uploadCtrl.uploadAvatar)

module.exports = router