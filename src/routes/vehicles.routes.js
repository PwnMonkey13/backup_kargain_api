const express = require('express')
const router = express.Router()
const cors = require('cors')
const rolesMiddleware = require('../middlewares/roles.middleware')
const corsMiddleware = require('../middlewares/cors.middleware')
const passportMiddleware = require('../middlewares/passport')
const vehicleController = require('../controllers/vehicles/vehicles.controller')

router.post('/bulk',
    cors(corsMiddleware.authedCors),
    vehicleController.bulkCars)

//admin only
// router.options('/:type/makes', cors(corsMiddleware.authedCors)) // enable pre-flights
router.post('/:vehicleType/makes',
    cors(corsMiddleware.authedCors),
    // passportMiddleware.authenticate('cookie', { session: false }),
    // rolesMiddleware.grantAccess('updateOwn', 'profile'),
    vehicleController.createMakes
)

//admin only
// router.options('/:type/makes', cors(corsMiddleware.authedCors)) // enable pre-flights
router.put('/:vehicleType/makes',
    cors(corsMiddleware.authedCors),
    // passportMiddleware.authenticate('cookie', { session: false }),
    // rolesMiddleware.grantAccess('updateOwn', 'profile'),
    vehicleController.updateMakes
)

//admin only
router.options('/dyn/:vehicleType/models', cors(corsMiddleware.authedCors)) // enable pre-flights
router.post('/dyn/:vehicleType/models',
    cors(corsMiddleware.authedCors),
    passportMiddleware.authenticate('cookie', { session: false }),
    rolesMiddleware.grantAccess('updateOwn', 'profile'),
    vehicleController.createModels
)

// type : ["buses", "scooters", "campers", "motorcycles", "trucks"];
router.get('/dyn/:vehicleType/makes',
    cors(corsMiddleware.clientCors),
    vehicleController.getMakes
)

//query : { make : String }
router.get('/dyn/:vehicleType/models',
    cors(corsMiddleware.clientCors),
    vehicleController.getModelsByMake
)

//query : { make : String }
router.get('/cars/distinct/make/models',
    cors(corsMiddleware.clientCors),
    vehicleController.getCarsModelsByMake
)

//query : { make : String, model : String }
router.get('/cars/distinct/make/model/trims',
    cors(corsMiddleware.clientCors),
    vehicleController.getCarsModelTrims
)

//query : { make : String, model : String, trim : String }
router.get('/cars/make/model/trim/years',
    cors(corsMiddleware.clientCors),
    vehicleController.getCarsModelTrimYears
)

module.exports = router
