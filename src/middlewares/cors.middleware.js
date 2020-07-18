const CONFIG = require('../config/config')
const Errors = require('../utils/Errors')

function corsOptions (allowCredentials = false, enableAllOrigin = false) {
    return {
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
        credentials: allowCredentials,
        preflightContinue: true,
        origin: function (origin, callback) {
            if (CONFIG.whileListDomains.indexOf(origin) !== -1 || enableAllOrigin) {
                callback(null, true)
            } else {
                callback(Errors.UnAuthorizedError('Not allowed by CORS'))
            }
        }
    }
}

const clientCors = corsOptions(false, true)

const authedCors = corsOptions(true, true)

const authedWideCors = corsOptions(true, true)

module.exports = { corsOptions, clientCors, authedCors, authedWideCors }
