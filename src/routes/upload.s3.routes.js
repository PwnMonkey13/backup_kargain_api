const express = require('express')
const app = express.Router()
const cors = require('cors')
const passportAuth = require('../middlewares/passport')
const AuthMiddleware = require('../middlewares/auth')
const corsMiddleware = require('../config/cors')
const uploadController = require('../controllers/upload.s3.controller')

app.get('/config',
    cors(corsMiddleware.authedCors),
    passportAuth.authenticate('cookie', { session: false }),
    AuthMiddleware.requireAdminOrSelf,
    uploadController.getS3Config
)

//TODO remove
// GET URL
app.get('/generate-get-url', cors(), uploadController.generateGetUrl)

//TODO remove
// PUT URL
app.get('/generate-put-url', cors(), uploadController.generatePutUrl)

module.exports = app
