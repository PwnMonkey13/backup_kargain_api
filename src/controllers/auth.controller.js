const jwt = require('jsonwebtoken')
const config = require('../config/config')
const User = require('../models').User

// Constants
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const PASSWORD_REGEX = /^(?=.*\d).{4,8}$/

const login = (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ success: false, msg: 'missing parameters' })
  if (!EMAIL_REGEX.test(email)) return res.status(400).json({ success: false, msg: 'email is not valid' })
  // if (!PASSWORD_REGEX.test(password)) { return res.status(400).json({ success: false, msg: 'password invalid (must length 4 - 8 and include 1 number at least)' }) }

  User.findOne({ email })
    .then(user => {
      if (!user) return res.status(404).json({ success: false, msg: 'user not found' })

      // generate a signed son web token with the contents of user object and return it in the response
      const token = jwt.sign({
          exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
          user: user
        },
        config.jwt.encryption
      )

      return res.json({ success: true, data: { user, token } })
    }).catch(next)
}

const register = async (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ success: false, msg: 'missing parameters' })
  if (!EMAIL_REGEX.test(email)) return res.status(400).json({ success: false, msg: 'email is not valid' })
  if (!PASSWORD_REGEX.test(password)) return next("password invalid (must length 4 - 8 and include 1 number at least");

  const user = new User({ ...req.body })

  user.save(user).then(document => {
    return res.json({ success: true, msg: 'User signed up successfully', document })
  }).catch(err => {
    return next(err)
  })
}

const registerPro = async (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ success: false, msg: 'missing parameters' })
  if (!EMAIL_REGEX.test(email)) return res.status(400).json({ success: false, msg: 'email is not valid' })
  if (!PASSWORD_REGEX.test(password)) return next("password invalid (must length 4 - 8 and include 1 number at least");

  let user = new User({ ...req.body })

  user.save().then(document => {
    return res.json({ success: true, message: 'User signed up successfully', data: document })
  }).catch(err => next(err))
}

function authorize (req, res) {
  return res.json({ success: true, isLoggedIn: true })
}

function deleteSession (req, res, next) {
  delete req.user
  return res.status(200).send({
    status: 'ok',
    message: 'You have been logged out.'
  })
}

module.exports = { login, register, registerPro, authorize, deleteSession }
