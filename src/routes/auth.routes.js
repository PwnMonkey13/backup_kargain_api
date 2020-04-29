const cors = require('cors')
const corsMiddleware = require('../config/cors')
const router = require('express').Router()
const authController = require('../controllers/auth.controller')
const passportAuth = require('../middlewares/passport')
const config = require('../config/config')

router.options('/login', cors(corsMiddleware.loginCors)) // enable pre-flights

router.post('/login',
    cors(corsMiddleware.loginCors),
    authController.LoginValidation,
    passportAuth.authenticate('local', { session: false }),
    authController.loginAction)

router.post('/register', authController.registerAction)

router.post('/register-pro', authController.registerProAction)

router.get('/authorize2', passportAuth.authenticate('cookie', { session: false }), authController.authorizeAction)

router.get('/authorize',
    cors(corsMiddleware.authCors),
    passportAuth.authenticate('cookie', { session: false }),
    authController.authorizeAction)

router.get('/authorizeSSR',
    cors(corsMiddleware.authCors),
    passportAuth.authenticate('jwt', { session: false }),
    authController.authorizeAction)

router.get('/confirm-email', authController.confirmEmailAction)

router.post('/forgot-password', authController.forgotPasswordAction);

router.post('/reset-password', authController.resetPasswordAction);

module.exports = router
