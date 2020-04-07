const jwt = require('jsonwebtoken')
const User = require('../models').User
const config = require('../config/config')
const mailer = require('../utils/mailer')
const authMailer = require('../components/mailer').auth;
const handleError = require('../utils/handleError');
const { uuid, fromString } = require('uuidv4');

// Constants
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const PASSWORD_REGEX = /^(?=.*\d).{4,8}$/

const loginAction = async (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) return next('missing parameters')
  if (!EMAIL_REGEX.test(email)) return next('email is not valid')

  try{
    const user = await User.findByEmail(email);
    const compare = await user.comparePassword(password);
    if(!compare) return next(handleError.UnAuthorizedError('Invalid password or email'));

    const token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
        user: user
      },
      config.jwt.encryption
    );

    // Adds a new cookie to the response
    res.cookie('token', token, {
      maxAge: 60 * 60 * 1000, // 1 hour
      httpOnly: true,
      // secure: true,
      // sameSite: true,
    })
    return res.json({ success: true, data: { user } })
  }catch (err) {
    next(err)
  }
}

const registerAction = async (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) return next('missing parameters');
  if (!EMAIL_REGEX.test(email)) return next('email is not valid');
  if (!PASSWORD_REGEX.test(password)) return next('Password invalid (must length 4 - 8 chars and include 1 number at least');

  const user = new User(req.body)

  const token = jwt.sign({
      email
    }, config.jwt.encryption, { expiresIn: '1h' }
  );

  try{
    const document = await user.save();
    const emailResult = await authMailer.confirmAccount({
      firstname: document.firstname,
      lastname : document.lastname,
      email : document.email,
      token,
      confirmUrl : `${config.frontend}/auth/confirm-email/${token}`
    });
    return res.json({ success: true, msg: 'User signed up successfully', emailResult, token })
  } catch (err) {
    next(err)
  }
}

const registerProAction = async (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ success: false, msg: 'missing parameters' })
  if (!EMAIL_REGEX.test(email)) return res.status(400).json({ success: false, msg: 'email is not valid' })
  if (!PASSWORD_REGEX.test(password)) return next('password invalid (must length 4 - 8 and include 1 number at least')

  const user = new User(req.body);

  const token = jwt.sign({
      email
    }, config.jwt.encryption, { expiresIn: '1h' }
  );

  try {
    const document = await user.save();
    const emailResult = await authMailer.confirmAccount({
      firstname: document.firstname,
      lastname : document.lastname,
      email : document.email,
      confirmUrl : `${config.frontend}/auth/confirm-email/${token}`
    });

    return res.json({ success: true, message: 'User signed up successfully', data: document, emailResult })
  } catch(err) {
    next(err)
  }
}

function authorizeAction (req, res) {
  return res.json({ success: true, isLoggedIn: true })
}

function deleteSessionAction (req, res, next) {
  delete req.user
  return res.json({ success: true, msg: 'You have been logged out.' })
}

const confirmEmailAction = async (req, res, next) => {
  const { token }  = req.query;
  try {
    const decoded = await jwt.verify(token, config.jwt.encryption);
    if(!decoded) return next('missing email');
    const { email } = decoded;
    if (!email) return next('missing email in token');
    try {
      const updated = await User.confirmUser(email);
      return res.json({ success: true, msg: 'User confirmed successfully', data: updated });
    } catch (err) {
      return next(err);
    }
  }catch (err) {
    return next(handleError.ExpiredTokenError('jwt expired'));
  }
}

const forgotPasswordAction = async (req,res, next) => {
  const { email }  = req.body;
  try {
    let user = await User.findByEmail(email);
    const token = jwt.sign({
        email: user.email
      }, config.jwt.encryption, { expiresIn: '1h' }
    );

    user.pass_reset = uuid();
    const document = await user.save();

    const emailResult = await authMailer.resetPassword({
      firstname: document.firstname,
      lastname : document.lastname,
      email : document.email,
      link : `${config.frontend}/auth/confirm-email/${token}`,
      token
    });

    return res.json({ success: true, data: { emailResult } });
  }catch (err) {
    next(err);
  }
}

const resetPasswordAction = async (req, res, next) => {
  const { token, password }  = req.body;
  try{
    const decoded = await jwt.verify(token, config.jwt.encryption);
    if(!decoded) return next('missing email');
    const { email } = decoded;
    const updated = await User.resetPassword(email, password);
    return res.json({ success: true, msg: 'User password updated successfully', data : updated })
  } catch (err) {
    next(err)
  }
};

const legacy = (req, res, next) => {
  const recipient = {
    firstname: 'nicolas',
    lastname: 'giraudo',
    email: 'giraudo.nicolas13@gmail.com'
  }

  const message = {
    from: {
      name: config.mailer.from.name,
      address: config.mailer.from.email
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

module.exports = {
  loginAction,
  registerAction,
  registerProAction,
  authorizeAction,
  deleteSessionAction,
  confirmEmailAction,
  forgotPasswordAction,
  resetPasswordAction,
}
