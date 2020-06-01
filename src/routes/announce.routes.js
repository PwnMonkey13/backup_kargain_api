const router = require('express').Router()
const cors = require('cors')
const corsMiddleware = require('../middlewares/cors.middleware')
const passportMiddleware = require('../middlewares/passport')
const authMiddleware = require('../middlewares/auth.middleware')
const announceController = require('../controllers/announce.controller')
const uploadController = require('../controllers/upload.s3.controller')

router.get('/',
    cors(),
    announceController.getAnnounces
)

router.get('/all',
    cors(),
    announceController.getAnnouncesAll
)

router.get('/user/:uid',
    cors(),
    announceController.getAnnouncesByUser
)

router.get('/slug/:slug',
    cors(corsMiddleware.authedCors),
    authMiddleware.byPassAuth,
    announceController.getAnnounceBySlug
)

router.options('/', cors(corsMiddleware.authedCors)) // enable pre-flights
router.post('/',
    cors(corsMiddleware.authedCors),
    passportMiddleware.authenticate('cookie', { session: false }),
    announceController.createAnnounce
)

router.options('/update/:slug', cors(corsMiddleware.authedCors)) // enable pre-flights
router.put('/update/:slug',
    cors(corsMiddleware.authedCors),
    passportMiddleware.authenticate('cookie', { session: false }),
    announceController.updateAnnounce
)

router.options('/confirm/:token', cors(corsMiddleware.authedCors)) // enable pre-flights
router.put('/confirm/:token',
    cors(corsMiddleware.authedCors),
    passportMiddleware.authenticate('cookie', { session: false }),
    announceController.confirmAnnounce
)

router.options('/toggleLike/:announce_id', cors(corsMiddleware.authedCors)) // enable pre-flights
router.put('/toggleLike/:announce_id',
    cors(corsMiddleware.authedCors),
    passportMiddleware.authenticate('cookie', { session: false }),
    announceController.toggleUserLike
)

router.options('/upload/:slug', cors(corsMiddleware.authedCors)) // enable pre-flights
router.post('/upload/:slug',
    cors(corsMiddleware.authedCors),
    passportMiddleware.authenticate('cookie', { session: false }),
    announceController.getBySlugAndNext,
    uploadController.postObjects,
    announceController.uploadImages
)

module.exports = router
