const AuthMailer = require('./auth')
const AnnouncesMailer = require('./announces')

module.exports = {
  auth: AuthMailer,
  announces : AnnouncesMailer
}
