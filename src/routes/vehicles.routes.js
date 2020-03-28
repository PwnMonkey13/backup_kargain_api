const express = require('express')
const routes = express.Router()
const cors = require('cors')
const corsConfig = require('../config/cors')
const carsController = require('../controllers/vehicles/cars.controller')
const internalVehicleController = require('../controllers/vehicles/internal.vehicles.controller');

routes.get('/cars', cors(corsConfig(false, true)), carsController.getData)

routes.post('/internal/:type/makes', internalVehicleController.createMakes)

//type : ["buses", "scooters", "campers", "motorcycles", "trucks"];
routes.get('/internal/:type/makes', internalVehicleController.getMakes)

routes.get('/internal/:type/:make/models', internalVehicleController.getModelsByMake)

routes.get('/del/:key', carsController.delCacheKey)

module.exports = routes
