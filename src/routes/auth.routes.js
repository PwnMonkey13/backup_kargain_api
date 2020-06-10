const cors = require('cors')
const router = require('express').Router()
const corsMiddleware = require('../middlewares/cors.middleware')
const authMiddleware = require('../middlewares/auth.middleware')
const passportMiddleware = require('../middlewares/passport')
const authController = require('../controllers/auth.controller')

router.options('/sso-register', cors(corsMiddleware.wideCors))
router.post('/sso-register',
    cors(corsMiddleware.wideCors),
    authController.ssoRegister,
    authController.loginAction
)

router.options('/login', cors(corsMiddleware.wideCors))
router.post('/login',
    cors(corsMiddleware.wideCors),
    authController.loginValidation,
    passportMiddleware.authenticate('local', { session: false }),
    authController.loginAction
)

router.options('/register', cors(corsMiddleware.wideCors))
router.post('/register',
    cors(corsMiddleware.wideCors),
    authController.registerAction,
    authController.sendEmailActivation
)

router.options('/register-pro', cors(corsMiddleware.wideCors))
router.post('/register-pro',
    cors(corsMiddleware.wideCors),
    authController.registerProAction,
    authController.sendEmailActivation
)

router.options('/ask-email-activation', cors(corsMiddleware.wideCors))
router.post('/ask-email-activation',
    cors(corsMiddleware.wideCors),
    authController.findUserByEmailMiddleware,
    authController.sendEmailActivation
)

router.options('/confirm-account/:token', cors(corsMiddleware.wideCors))
router.put('/confirm-account/:token',
    cors(corsMiddleware.wideCors),
    authController.confirmEmailTokenAction
)

router.get('/authorize',
    cors(corsMiddleware.authedCors),
    authMiddleware.byPassAuth,
    authController.authorizeAction
)

router.options('/logout', cors(corsMiddleware.wideCors))
router.post('/logout',
    cors(corsMiddleware.authedCors),
    authController.logoutAction
)

router.options('/forgot-password', cors(corsMiddleware.wideCors))
router.post('/forgot-password',
    cors(corsMiddleware.wideCors),
    authController.forgotPasswordAction
)

router.options('/reset-password', cors(corsMiddleware.wideCors))
router.post('/reset-password',
    cors(corsMiddleware.wideCors),
    authController.resetPasswordAction
)

module.exports = router
