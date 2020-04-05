const cors = require('cors')
const router = require('express').Router()
const authController = require('../controllers/auth.controller')
const passportAuth = require('../middlewares/passport');

router.post('/login', cors(), authController.loginAction)

router.post('/register', authController.registerAction)

router.post('/register-pro', authController.registerProAction)

router.get('/authorize', passportAuth.authenticate('jwt', { session: false }), authController.authorizeAction)

router.get('/logout', passportAuth.authenticate('jwt', { session: false }), authController.deleteSessionAction)

router.get('/confirm-account', authController.confirmEmailAction)

router.post('/forgot-password', authController.forgotPasswordAction);

router.post('/reset-password', authController.resetPasswordAction);

module.exports = router
