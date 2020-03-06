const cors = require('cors')
const router = require('express').Router()
const authController = require('../controllers/auth.controller')
const passportAuth = require('../middlewares/passport');

const whitelist = ['http://localhost:3000', 'https://kargain-app.now.sh']
const corsOptions = {
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  preflightContinue: true,
  // credentials: true,
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

router.post('/login', authController.login)

router.post('/register', authController.register)

router.post('/register-pro', authController.registerPro)

router.get('/authorize', passportAuth.authenticate('jwt', { session: false }), authController.authorize)

router.get('/logout', passportAuth.authenticate('jwt', { session: false }), authController.deleteSession)

module.exports = router
