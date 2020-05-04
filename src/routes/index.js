const express = require('express')
const router = express.Router()
const CONFIG = require('../config/config')
const authRoutes = require('./auth.routes')
const usersRoutes = require('./users.routes')
const AnnouncesRoutes = require('./announce.routes')
const VehiclesRoutes = require('./vehicles.routes')
const VINDecoderRoutes = require('./vindecoder.routes')
const PlacesRoutes = require('./places.routes')
const DevRoutes = require('./dev.routes')
const UploadS3 = require('./upload.s3.routes')
const Comments = require('./comments.routes')

const passportAuth = require('../middlewares/passport')
const AuthMiddleware = require('../middlewares/auth')

router.use('/uploads', UploadS3)
router.use('/auth', authRoutes)
router.use('/users', usersRoutes)
router.use('/ads', AnnouncesRoutes)
router.use('/vehicles', VehiclesRoutes)
router.use('/vindecoder', VINDecoderRoutes)
router.use('/places', PlacesRoutes)
router.use('/comments', Comments)

if (CONFIG.isDev) {
  router.use('/dev', DevRoutes)
}

module.exports = router
