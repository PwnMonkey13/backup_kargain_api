const cors = require('cors')
const path = require('path')
const helmet = require('helmet')
const express = require('express')
const passport = require('passport')
const bodyParser = require('body-parser')
const session = require('express-session')
const cookieParser = require('cookie-parser')
// const cookieSession = require('cookie-session')
const fileUpload = require('express-fileupload')
const config = require('./config/config')
const routes = require('./routes')
const app = express()

app.use(helmet())
app.use(bodyParser.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')));

app.set('trust proxy', 1) // trust first proxy

// view engine setup
// app.set('views', path.join(__dirname, '../', 'views'));
// app.set('view engine', 'twig');

app.use(passport.initialize({ session: false }))
// app.use(passport.inistialize());
// app.use(passport.session());

// enable files upload
app.use(fileUpload({
  createParentPath: true
}));

app.use(config.api_path, routes)

app.get('*', function (req, res, next) {
  const err = new Error('Page Not Found')
  err.statusCode = 404
  next(err)
})

app.use(function (err, req, res, next) {
  const isError = err instanceof Error;
  const code = err.code || err.statusCode || 200;
  let message = isError ? err.message : err;
  // if(!config.isDev) message = 'Something failed on server';

  const error = {
    name : err.name || "Error",
    code,
    message
  };

  return res.json({ success: false, error})
})

module.exports = app
