const express = require('express')
const routes = express.Router()
const cors = require('cors')
const corsConfig = require('../middlewares/cors.middleware')
const vinDecoderController = require('../controllers/vehicles/vindecoder.controller')

routes.get('/decodefree/:vin', vinDecoderController.decodeFree)

routes.get('/decode/:vin', vinDecoderController.decode)

routes.get('/image/:vin', vinDecoderController.image)

module.exports = routes
