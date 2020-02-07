const router = require('express').Router()
const announceController = require('../controllers/announce.controller')
const passportAuth = require('../middlewares/passport');

router.get('/', announceController.getAll)

router.post('/', passportAuth.authenticate('jwt', { session: false }), announceController.create)

module.exports = router
