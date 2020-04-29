const router = require('express').Router()
const announceController = require('../controllers/announce.controller')
const passportAuth = require('../middlewares/passport');
const cors = require('cors')

router.use(cors())

router.get('/legacy/:base64params', announceController.getAnnouncesLegacy)

router.get('/', announceController.getAnnounces)

router.get('/user/:uid', announceController.getAnnouncesByUser)

router.get('/slug/:slug', announceController.getBySlug)

// router.post('/', passportAuth.authenticate('jwt', { session: false }), announceController.create)

router.post('/', announceController.create)

module.exports = router
