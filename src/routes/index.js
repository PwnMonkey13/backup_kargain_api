const express = require('express')
const router = express.Router()
const CONFIG = require('../config/config')
const authRoutes = require('./auth.routes')
const usersRoutes = require('./users.routes')
const announcesRoutes = require('./announce.routes')
const vehiclesRoutes = require('./vehicles.routes')
const vinDecoderRoutes = require('./vindecoder.routes')
const placesRoutes = require('./places.routes')
const devRoutes = require('./dev.routes')
const uploadS3Routes = require('./upload.s3.routes')
const commentsRoutes = require('./comments.routes')
const searchRoutes = require('./search.routes')
const paymentsRoutes = require('./payments.routes')

router.use('/auth', authRoutes)
router.use('/users', usersRoutes)
router.use('/ads', announcesRoutes)
router.use('/vehicles', vehiclesRoutes)
router.use('/vindecoder', vinDecoderRoutes)
router.use('/places', placesRoutes)
router.use('/uploads', uploadS3Routes)
router.use('/comments', commentsRoutes)
router.use('/search', searchRoutes)
router.use('/payments', paymentsRoutes)

if (!CONFIG.isProd) {
    router.use('/dev', devRoutes)
}

module.exports = router
