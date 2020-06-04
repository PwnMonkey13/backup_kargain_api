const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const { JwtStrategy, ExtractJwt } = require('passport-jwt')
const CookieStrategy = require('passport-cookie').Strategy
const jwt = require('jsonwebtoken')
const config = require('../config/config')
const User = require('../models').User
const Errors = require('../utils/Errors')

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser(async (id, done) => {
    try {
        const userObj = await User.findById(id, '-password')
        return done(null, userObj)
    } catch (error) {
        done(error)
    }
})

passport.use(new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'email',
        passwordField: 'password'
    },
    async function (req, email, password, done) {
        try {
            const user = await User.findByEmail(email)
            if (!user || !await user.comparePassword(password)) {
                return done(Errors.UnAuthorizedError('unknown user or invalid password'))
            }
            return done(null, user)
        } catch (err) {
            return done(err)
        }
    }))

// Setting up JWT login strategy
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwt.encryption
}, (jwtPayload, done) => {
    if (jwtPayload.uid) {
        User.findOne({ _id: jwtPayload.uid }, function (err, user) {
            if (err) return done(err)
            if (!user) return done('missing user')
            return done(null, user)
        })
    } else return done(null, 'invalid user')
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
