const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const session = require('cookie-session');
const helmet = require('helmet')
const cors = require('cors')
const passport = require('passport')
const config = require('./config')
const routes = require('../routes')
const app = express()
const tableRoutes = require('../routes/tableRoutes');

app.use(bodyParser.json())
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(passport.initialize({session : false }));

// app.use(session({
//   secret: 'somesecret',
//   key: 'sid',
//   cookie: {
//     secure: true,
//     maxAge: 5184000000 // 2 months
//   }
// }));

app.use((req, res, next) => {
  console.log(req.headers.origin);

  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE')
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next()
})

app.use('/api', routes)


app.get('/', function (req, res, next) {
  res.json({
      success: true,
      msg : `API is serving from ${config.db.mongo_location}`
    });
})

app.get('/endpoints', function(req, res, next){
  tableRoutes(app);
});

// Tells Express to allows data to be sent across different origins
// required by CORS policy
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "localhost:3000");
//   res.header('Access-Control-Allow-Credentials', true);
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

app.get('*', function (req, res, next) {
  const err = new Error('Page Not Found')
  err.statusCode = 404
  next(err)
})

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = config.isDev ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');

  let msg = err.message || err
  msg = config.isDev ? msg : 'Something failed on server';
  res.json({ success: false, msg});
})

module.exports = app
