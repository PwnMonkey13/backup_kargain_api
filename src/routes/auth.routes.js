const router = require('express').Router()
const authController = require('../controllers/auth.controller')
const passportAuth = require('../middlewares/passport');

router.post('/login', authController.login)

router.post('/register', authController.register)

router.post('/register-pro', authController.registerPro)

router.get('/authorize', passportAuth.authenticate('jwt', { session: false }), authController.authorize)

router.get('/logout', passportAuth.authenticate('jwt', { session: false }), authController.deleteSession)

module.exports = router
