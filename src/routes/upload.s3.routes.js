const express = require('express')
const app = express.Router()
const cors = require('cors')
const uploadController = require('../controllers/upload.s3.controller')

app.get('/config', uploadController.getS3Config)

app.post('/post-objects', cors(), uploadController.postObjects)

// GET URL
app.get('/generate-get-url', cors(), uploadController.generateGetUrl)

// PUT URL
app.get('/generate-put-url', cors(), uploadController.generatePutUrl)

module.exports = app
