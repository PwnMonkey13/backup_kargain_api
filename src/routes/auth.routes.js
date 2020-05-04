const cors = require('cors')
const corsMiddleware = require('../config/cors')
const router = require('express').Router()
const authController = require('../controllers/auth.controller')
const passportAuth = require('../middlewares/passport')

router.options('/login', cors(corsMiddleware.clientCors)) // enable pre-flights

router.post('/login',
    cors(corsMiddleware.clientCors),
    authController.LoginValidation,
    passportAuth.authenticate('local', { session: false }),
    authController.loginAction)

router.post('/register', authController.registerAction)

router.post('/register-pro', authController.registerProAction)

router.get('/authorizeSSR',
    cors(corsMiddleware.authedCors),
    passportAuth.authenticate('cookie', { session: false }),
    authController.authorizeAction)

router.get('/confirm-email', authController.confirmEmailAction)

router.post('/forgot-password', authController.forgotPasswordAction)

router.post('/reset-password', authController.resetPasswordAction)

module.exports = router
