const path = require('path')
const helmet = require('helmet')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const config = require('./config/config')
const routes = require('./routes')
const app = express()

app.use(helmet())
app.use(bodyParser.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '../', 'public')))
app.set('trust proxy', 1) // trust first proxy

// enable files upload
app.use(fileUpload({
    createParentPath: true
}))

app.use((req, res, next) => {
    if (!req.headers.origin) {
        req.headers.origin = req.protocol + '://' + req.get('host')
    }
    next()
})

app.get('/', function (req, res, next) {
    return res.end('api live')
})

app.get('/db', function (req, res, next) {
    return res.end(config.db.mongo_location)
})

app.get('/config', function (req, res, next) {
    return res.json({
        success: true,
        data: {
            config
        }
    })
})

app.use(config.api_path, routes)

app.get('*', function (req, res, next) {
    const err = new Error('Page Not Found')
    err.statusCode = 404
    next(err)
})

app.use(function (err, req, res, next) {
    const isError = err instanceof Error
    const code = err.code || err.statusCode || 200
    const error = {
        code,
        name: err.name || 'Error',
        message: isError ? err.message : err
    }
    return res.json({ success: false, isProd : config.isProd, isError, error })
})

module.exports = app
