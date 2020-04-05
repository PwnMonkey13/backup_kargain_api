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

app.use(config.api_path, routes)

app.get('/', function (req, res, next) {
  res.json({
    success: true,
    msg: `API is serving from ${config.db.mongo_location}`
  })
})

app.get('/endpoints', function (req, res, next) {
  tableRoutes(app)
})

app.get('*', function (req, res, next) {
  const err = new Error('Page Not Found')
  err.statusCode = 404
  next(err)
})

app.use(function (err, req, res, next) {
  const isError = err instanceof Error;
  const code = err.code || err.statusCode || 500;
  let message = isError ? err.message : err;
  if(!config.isDev) message = 'Something failed on server';

  const error = {
    name : err.name || "Error",
    code,
    message
  };

  res.json({ success: false, error})
})

module.exports = app
