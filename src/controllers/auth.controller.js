const jwt = require('jsonwebtoken')
const { uuid } = require('uuidv4')
const pwdGenerator = require('generate-password')
const config = require('../config/config')
const authMailer = require('../components/mailer').auth
const Errors = require('../utils/Errors')
const User = require('../models').User

// Constants
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const PASSWORD_REGEX = /^(?=.*\d).{4,8}$/

const findUserByEmailMiddleware = async (req, res, next) => {
    if (!req.body.email) return next(Errors.NotFoundError('missing email'))
    try {
        req.user = await User.findByEmail(req.body.email)
        next()
    } catch (err) {
        return next(err)
    }
}

const loginValidation = (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password) return next('missing parameters')
    if (!EMAIL_REGEX.test(email)) return next('email is not valid')
    if (!PASSWORD_REGEX.test(password)) return next('password is not valid')
    else next()
}

const ssoRegister = async (req, res, next) => {
    const data = req.body
    
    try {
        const user = await User.findByEmail(data.email)
        if (!user) {
            const pwd = pwdGenerator.generate({ length: 16 })
            const newUser = new User({
                ...data,
                sso: true,
                password: pwd,
                clear_password: pwd,
            })
            req.user = await newUser.save()
        } else {
            req.user = user
        }
        next()
    } catch (err) {
        return next(err)
    }
}

const loginAction = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError('unknown user'))
    
    const user = req.user
    const expirationTimeSeconds = Date.now() + 1000 * 60 * 60 * 24 * 10
    const token = jwt.sign({
            exp: Math.floor(expirationTimeSeconds / 1000), // 10days (seconds)
            uid: user._id
        },
        config.jwt.encryption
    )
    
    // Adds a new cookie to the response
    return res.cookie('token',
        token, {
            expires: new Date(expirationTimeSeconds), // 10days (milliseconds)
            httpOnly: true
            // signed: true,
            // secure: true,
            // sameSite: true,
        }
    ).json({
        success: true,
        data: user,
    })
}

const logoutAction = async (req, res, next) => {
    req.logout()
    return res.cookie('token',
        null, {
            maxAge: 0,
            httpOnly: true
        }
    ).json({ success: true, data: { msg: 'cookie destroyed' } })
}

const registerAction = async (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password) return next('missing parameters')
    if (!EMAIL_REGEX.test(email)) return next('email is not valid')
    if (!PASSWORD_REGEX.test(password)) return next('Password invalid (must length 4 - 8 chars and include 1 number at least')
    
    const user = new User(req.body)
    
    try {
        const doc = await user.save()
        return res.json({ success: true, user, doc })
        
    } catch (err) {
        return res.json({ success: false, err })
    }
}

const registerProAction = async (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ success: false, msg: 'missing parameters' })
    if (!EMAIL_REGEX.test(email)) return res.status(400).json({ success: false, msg: 'email is not valid' })
    if (!PASSWORD_REGEX.test(password)) return next('password invalid (must length 4 - 8 and include 1 number at least')
    
    const user = new User({
        ...req.body,
        pro: true
    })
    
    try {
        req.user = await user.save()
        next()
        
    } catch (err) {
        next(err)
    }
}

const confirmEmailTokenAction = async (req, res, next) => {
    const { token } = req.params
    try {
        const decoded = await jwt.verify(token, config.jwt.encryption)
        if (!decoded.email) return next(Errors.UnAuthorizedError())
        try {
            const updated = await User.confirmUserEmail(decoded.email)
            return res.json({
                success: true,
                data: updated
            })
        } catch (err) {
            return next(err)
        }
    } catch (err) {
        return next(err)
    }
}

const sendEmailActivation = async (req, res, next) => {
    if (!req.user) return next(Errors.NotFoundError('missing user to activate'))
    
    const token = jwt.sign({ email: req.user.email },
        config.jwt.encryption,
        { expiresIn: '1h' }
    )
    
    await authMailer.confirmAccount({
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        email: req.user.email,
        link: token ? `${config.frontend}/auth/confirm-account?token=${token}` : null
    })
    
    return res.json({
        success: true,
    })
}

const authorizeAction = async (req, res) => {
    return res.json({
        success: true,
        data: req.user
    })
}

const forgotPasswordAction = async (req, res, next) => {
    const { email } = req.body
    try {
        const user = await User.findByEmail(email)
        const token = jwt.sign({
                email: user.email
            }, config.jwt.encryption, { expiresIn: '1h' }
        )
        
        user.pass_reset = uuid()
        const document = await user.save()
        
        const emailResult = await authMailer.resetPassword({
            firstname: document.firstname,
            lastname: document.lastname,
            email: document.email,
            link: token ? `${config.frontend}/auth/confirm-email/${token}` : null
        })
        
        return res.json({
            success: true,
            data: emailResult
        })
    } catch (err) {
        next(err)
    }
}

const resetPasswordAction = async (req, res, next) => {
    const { token, password } = req.body
    try {
        const decoded = await jwt.verify(token, config.jwt.encryption)
        if (!decoded) return next('missing email')
        const { email } = decoded
        const updated = await User.resetPassword(email, password)
        return res.json({
            success: true,
            data: updated
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    findUserByEmailMiddleware,
    loginValidation,
    ssoRegister,
    loginAction,
    logoutAction,
    registerAction,
    registerProAction,
    authorizeAction,
    confirmEmailTokenAction,
    sendEmailActivation,
    forgotPasswordAction,
    resetPasswordAction
}
