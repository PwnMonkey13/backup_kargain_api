const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const cors = require('cors')
const passport = require('passport')
const config = require('./config')
const routes = require('../routes')
const app = express()
const tableRoutes = require('../routes/tableRoutes')

app.use(helmet())
app.use(cors())
app.use(bodyParser.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(passport.initialize({ session: false }))


app.use('/api', routes)

app.get('/', function (req, res, next) {
  res.json({
    success: true,
    msg: `API is serving from ${config.db.mongo_location}`
  })
})

app.get('/endpoints', function (req, res, next) {
  tableRoutes(app)
})

// app.get('*', function (req, res, next) {
//   const err = new Error('Page Not Found')
//   err.statusCode = 404
//   next(err)
// })

app.use(function (err, req, res, next) {
  // render the error page
  let msg = err.message || err
  msg = config.isDev ? msg : 'Something failed on server'
  console.log(msg)
  res.status(err.status || 500).json({ success: false, msg })
})

module.exports = app
