const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const cors = require('cors')
const passport = require('passport');
const config = require('./config')
const routes = require('../routes')
const app = express()
const tableRoutes = require('../routes/tableRoutes');

app.use(helmet())
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(passport.initialize());

if (config.isDev) {
  app.use(logger('dev'))
}

app.use('/api', routes)

app.get('/', function (req, res, next) {
  res.json(
    {
      success: true,
      msg : `API is serving from ${config.db.mongo_location}`,
      config,
      env : process.env
    })
})

app.get('/endpoints', function(req, res, next){
  tableRoutes(app);
});

app.get('*', function (req, res, next) {
  const err = new Error('Page Not Found')
  err.statusCode = 404
  next(err)
})

app.use(function (err, req, res, next) {
  const statusCode = err.statusCode || 500
  let msg = err.message || err
  msg = config.isDev ? msg : 'Something failed on server'
  res.status(statusCode).json({ success: false, msg});
})

module.exports = app
