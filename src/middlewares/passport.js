const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const CookieStrategy = require('passport-cookie').Strategy
const CustomStrategy = require('passport-custom').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const jwt = require('jsonwebtoken')
const config = require('../config/config')
const User = require('../models').User
const Errors = require('../utils/Errors')

/**
 * Called when user is added into the session.
 *
 * It stores only the unique id of the user into the session.
 *
 */
passport.serializeUser(function (user, done) {
    return done(null, user.id)
})

/**
 * Called when we need the values of the
 *
 * It takes the id into the session then finds the user in the database
 * and returns it.
 *
 * You can store whole user data into the session to avoid calling database for user.
 */
passport.deserializeUser(async function (id, done) {
    try {
        const userObj = await User.findById(id, '-password')
        return done(null, userObj)
    } catch (error) {
        done(error)
    }
})

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwt.encryption
}

passport.use(new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'email',
        passwordField: 'password'
    }, async function (req, email, password, done) {
        try {
            const user = await User.findByEmail(email)
            if (!user || !await user.comparePassword(password)) {
                return done(Errors.UnAuthorizedError('unknown user or invalid password'))
            }
            return done(null, user)
        } catch (err) {
            return done(err)
        }
    }
))

// Setting up JWT login strategy
passport.use(new JwtStrategy(opts, (jwtPayload, done) => {
    if (jwtPayload.uid) {
        User.findOne({ _id: jwtPayload.uid }, function (err, user) {
            if (err) return done(err)
            if (!user) return done('missing user')
            return done(null, user)
        })
    } else return done(null, 'invalid user')
}))

passport.use('bypassAuth', new CustomStrategy(async function (req, callback) {
    try {
        const token = req?.signedCookies?.['token'] ?? req?.cookies?.['token'] ?? null
        if (!token) callback(null)
        callback(null, {})
        
        // const decoded = await jwt.verify(token, config.jwt.encryption)
        // if (!decoded || !decoded.uid) return callback('invalid token')
        // const user = await User.findById(decoded.uid)
        // callback(null, user);
    } catch (err) {
        return callback(err)
    }
}))

// Setting up Cookie based login strategy
passport.use(new CookieStrategy(async (token, done) => {
    try {
        const decoded = await jwt.verify(token, config.jwt.encryption)
        if (!decoded || !decoded.uid) return done('invalid token')
        const user = await User.findById(decoded.uid)
        if (!user) return done('unknown user, try again')
        else return done(null, user)
    } catch (err) {
        return done(err)
    }
}))

module.exports = passport
