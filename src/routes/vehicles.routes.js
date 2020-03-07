const express = require('express')
const routes = express.Router()
const cors = require('cors')
const corsConfig = require('../config/cors')
const carsController = require('../controllers/vehicles/cars.controller')

routes.get('/cars', cors(corsConfig(false, true)), carsController.getData)

routes.get('/test', carsController.test)

module.exports = routes
