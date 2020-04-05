const CONFIG = require('./config')

function setCorsResponseHeaders(allowCredentials = false, enableAllOrigin = false) {
  return {
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    credentials: allowCredentials,
    preflightContinue: true,
    origin: function (origin, callback) {
      if (CONFIG.whileListDomains.indexOf(origin) !== -1 || enableAllOrigin) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    }
  }
}

module.exports = setCorsResponseHeaders
