const express = require('express')
const router = express.Router()
const cors = require('cors')
const rolesMiddleware = require('../middlewares/roles.middleware')
const corsMiddleware = require('../middlewares/cors.middleware')
const passportMiddleware = require('../middlewares/passport')
const carsController = require('../controllers/vehicles/cars.controller')
const internalVehicleController = require('../controllers/vehicles/internal.vehicles.controller')

router.get('/cars',
    cors(corsMiddleware.clientCors),
    carsController.getDataAction
)

// type : ["buses", "scooters", "campers", "motorcycles", "trucks"];
router.get('/internal/:type/makes',
    cors(corsMiddleware.clientCors),
    internalVehicleController.getMakes
)

router.get('/internal/:type/:make/models',
    cors(corsMiddleware.clientCors),
    internalVehicleController.getModelsByMake
)

//admin only

router.options('/internal/:type/makes', cors(corsMiddleware.authedCors)) // enable pre-flights
router.post('/internal/:type/makes',
    cors(corsMiddleware.authedCors),
    passportMiddleware.authenticate('cookie', { session: false }),
    rolesMiddleware.grantAccess('updateOwn', 'profile'),
    internalVehicleController.createMakes
)

router.get('/del/:key',
    cors(corsMiddleware.authedCors),
    passportMiddleware.authenticate('cookie', { session: false }),
    rolesMiddleware.grantAccess('updateOwn', 'profile'),
    carsController.delCacheKey
)

module.exports = router
