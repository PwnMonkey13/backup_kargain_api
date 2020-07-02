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
const conversationsRoutes = require('./conversations.routes')

router.use('/auth', authRoutes)
router.use('/users', usersRoutes)
router.use('/announces', announcesRoutes)
router.use('/vehicles', vehiclesRoutes)
router.use('/vindecoder', vinDecoderRoutes)
router.use('/places', placesRoutes)
router.use('/uploads', uploadS3Routes)
router.use('/comments', commentsRoutes)
router.use('/search', searchRoutes)
router.use('/payments', paymentsRoutes)
router.use('/conversations', conversationsRoutes)

router.get('/origin', function (req, res, next) {
    return res.json({
        success: true,
        data: {
            origin: req.headers.origin
        }})
})

if (!CONFIG.isProd) {
    router.use('/dev', devRoutes)
    
    router.get('/db', function (req, res, next) {
        return res.end(config.db.mongo_location)
    })
    
    router.get('/config', function (req, res, next) {
        return res.json({
            success: true,
            data: {
                config
            }
        })
    })
}

module.exports = router
