const router = require('express').Router()
const announceController = require('../controllers/announce.controller')
const passportAuth = require('../middlewares/passport');

router.get('/', announceController.getAll)

router.get('/slug/:slug', announceController.getBySlug)

router.post('/', passportAuth.authenticate('jwt', { session: false }), announceController.create)

module.exports = router
