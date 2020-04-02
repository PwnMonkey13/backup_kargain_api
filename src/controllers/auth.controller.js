const jwt = require('jsonwebtoken')
const config = require('../config/config')
const User = require('../models').User
const CONFIG = require('../config/config')
const mailer = require('../utils/mailer')

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

      res.cookie('token', token, {
        maxAge: 60 * 60 * 1000, // 1 hour
        httpOnly: true,
        // secure: true,
        // sameSite: true,
      }) // Adds a new cookie to the response

      return res.json({ success: true, data: { user, token } })
    }).catch(next)
}

const register = async (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ success: false, msg: 'missing parameters' })
  if (!EMAIL_REGEX.test(email)) return res.status(400).json({ success: false, msg: 'email is not valid' })
  if (!PASSWORD_REGEX.test(password)) return next('password invalid (must length 4 - 8 and include 1 number at least')

  const user = new User({
    ...req.body,
    activated: true,
    email_validated: false,
  })

  try{
    const document = await user.save();
    const emailResult = await confirmEmail({
      firstname: document.firstname,
      lastname : document.lastname,
      email : document.email
    });

    return res.json({ success: true, msg: 'User signed up successfully', document, emailResult })
  } catch (err) {
    next(err)
  }
}

const registerPro = async (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ success: false, msg: 'missing parameters' })
  if (!EMAIL_REGEX.test(email)) return res.status(400).json({ success: false, msg: 'email is not valid' })
  if (!PASSWORD_REGEX.test(password)) return next('password invalid (must length 4 - 8 and include 1 number at least')

  let user = new User({ ...req.body })

  try {
    const document = await user.save();
    return res.json({ success: true, message: 'User signed up successfully', data: document })
  } catch(err) {
    next(err)
  }
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

const testEmail = (req, res, next) => {
  mailer.test((err, info) => {
    if(err) next(err);
    else return res.json({ success: true, info });
  });
}

const verifyEmail = (req, res, next) => {
  mailer.verify((err, info)=> {
    if(err) next(err);
    else return res.json({ success: true, info });
  });
}

const legacy = (req, res, next) => {
  const recipient = {
    firstname: 'nicolas',
    lastname: 'giraudo',
    email: 'giraudo.nicolas13@gmail.com'
  }

  const message = {
    from: {
      name: CONFIG.mailer.from.name,
      address: CONFIG.mailer.from.email
    },
    to: {
      name: `${recipient.lastname} ${recipient.lastname}`,
      address: recipient.email
    },
    subject: 'Message title',
    text: 'Plaintext version of the message',
  }

  mailer.nodeMailerLegacy(message, (err, info)=> {
    if(err) next(err);
    else return res.json({ success: true, info });
  });
}

const confirmEmail = async params => {
  const message = {
    Messages: [
      {
        From: {
          Email: CONFIG.mailer.from.name,
          Name: CONFIG.mailer.from.name,
        },
        To: [
          {
            Email: 'giraudo.nicolas13@gmail.com',
            Name: `${params.lastname} ${params.firstname}`
          }
        ],
        TemplateID: 1331067,
        TemplateLanguage: true,
        Subject: "Activation Mail Kargain",
        Variables: {
          activation_link: 'https://app.mailjet.com/template/1331067/send'
        }
      }
    ]
  };

  try {
    return await mailer.sendMailJet(message);
  } catch (err) {
    next(err);
  }
}

module.exports = { login, register, registerPro, authorize, deleteSession, testEmail, verifyEmail, confirmEmail }
