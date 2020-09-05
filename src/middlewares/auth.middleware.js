const jwt = require('jsonwebtoken')
const Errors = require('../utils/Errors')
const Messages = require('../config/messages')
const config = require('../config/config')
const User = require('../models').User

const byPassAuth = (options) => async (req, res, next) => {
    try {
        const token = req?.signedCookies?.['token'] ?? req?.cookies?.['token'] ?? null
        if (!token) return next()
        
        const decoded = await jwt.verify(token, config.jwt.encryption)
        if (!decoded || !decoded.uid) return next(Errors.UnAuthorizedError(Messages.errors.user_not_found))
        
        const populate = options?.populate;
        const user = await User.findById(decoded.uid).populate(populate)
        if (user && !user?.removed === true) req.user = user
        next()
    } catch (err) {
        return next(err)
    }
}
module.exports = {
    byPassAuth
}
