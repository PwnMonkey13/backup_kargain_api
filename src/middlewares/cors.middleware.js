const CONFIG = require('../config/config')
const Errors = require('../utils/errors')

function corsOptions (allowCredentials = false) {
    return {
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
        preflightContinue: true,
        origin: 'https://kargain-app.vercel.app',
        credentials: true
        // origin: function (origin, callback) {
        //     if (config.whileListDomains.indexOf(origin) !== -1 || enableAllOrigin) {
        //         logger
        //         callback(null, allowCredentials ? origin : true)
        //     } else {
        //         callback(Errors.UnAuthorizedError('Not allowed by CORS'))
        //     }
        // }
    }
}

const manualCors = (req, res, next) => {
    const origin = req.headers.origin
    if (config.whileListDomains.indexOf(origin) !== -1){
        res.header('Access-Control-Allow-Origin', origin)
    } else {
        res.header('Access-Control-Allow-Origin', true)
    }
    res.header('Access-Control-Allow-Credentials', true)
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    next()
}

const clientCors = corsOptions(false, true)

const authedCors = corsOptions(true, true)

const authedWideCors = corsOptions(true, true)

module.exports = { corsOptions, clientCors, authedCors, authedWideCors }
