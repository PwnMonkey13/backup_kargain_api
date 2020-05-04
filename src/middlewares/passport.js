const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const CookieStrategy = require('passport-cookie').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const jwt = require('jsonwebtoken')
const config = require('../config/config')
const User = require('../models').User

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
            if (!user) { return done(null, false) }
            if (!await user.comparePassword(password)) {
                return done(null, false)
            }
            return done(null, user)
        } catch (err) {
            return done(null, err)
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

// Setting up Cookie based login strategy
passport.use(new CookieStrategy(async (token, done) => {
    console.log("token")
    console.log(token)
    try {
        const raw = await jwt.decode(token);
        console.log(raw)
        const decoded = await jwt.verify(token, config.jwt.encryption)
        if (!decoded || !decoded.uid) return done('missing uid')
        const user = await User.findById(decoded.uid)
        if (!user) return done('unknown user, try again')
        else return done(null, user)
    } catch (err) {
        return done(err)
    }
}))

module.exports = passport
