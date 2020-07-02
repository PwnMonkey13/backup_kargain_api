const jwt = require('jsonwebtoken')
const config = require('../config/config')
const User = require('../models').User

const byPassAuth = async (req, res, next) => {
    try {
        const token = req?.signedCookies?.['token'] ?? req?.cookies?.['token'] ?? null
        if (!token) return next()
        const decoded = await jwt.verify(token, config.jwt.encryption)
        if (!decoded || !decoded.uid) return next('invalid token')
        const user = await User.findById(decoded.uid)
        if (user && !user?.removed === true) {
            req.user = user
        }
        next()
    } catch (err) {
        return next(err)
    }
}
module.exports = {
    byPassAuth
}
