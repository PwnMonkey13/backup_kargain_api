const router = require('express').Router()
const cors = require('cors')
const corsMiddleware = require('../config/cors')
const AuthMiddleware = require('../middlewares/auth')
const passportAuth = require('../middlewares/passport')
const announceController = require('../controllers/announce.controller')
const uploadController = require('../controllers/upload.s3.controller')

router.get('/legacy/:base64params',
    cors(),
    announceController.getAnnouncesLegacy
)

router.get('/',
    cors(),
    announceController.getAnnounces
)

router.get('/user/:uid', announceController.getAnnouncesByUser)

router.get('/slug/:slug',
    announceController.getBySlug
)

router.options('/', cors(corsMiddleware.wideCors)) // enable pre-flights
router.post('/',
    cors(corsMiddleware.wideCors),
    passportAuth.authenticate('cookie', { session: false }),
    announceController.createAnnounce
)

router.options('/upload', cors(corsMiddleware.authedCors)) // enable pre-flights
router.post('/upload/:slug',
    cors(corsMiddleware.authedCors),
    passportAuth.authenticate('cookie', { session: false }),
    announceController.getBySlugAndNext,
    uploadController.postObjects,
    announceController.uploadImages
)

module.exports = router
