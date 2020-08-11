const express = require('express')
const router = express.Router()
const cors = require('cors')
const rolesMiddleware = require('../middlewares/roles.middleware')
const corsMiddleware = require('../middlewares/cors.middleware')
const passportMiddleware = require('../middlewares/passport')
// const carsController = require('../controllers/vehicles/open.data.api.controller')
const vehicleController = require('../controllers/vehicles/vehicles.controller')

router.post('/bulk',
    cors(corsMiddleware.authedCors),
    vehicleController.bulkCars)

//admin only
// router.options('/:type/makes', cors(corsMiddleware.authedCors)) // enable pre-flights
router.post('/:type/makes',
    cors(corsMiddleware.authedCors),
    // passportMiddleware.authenticate('cookie', { session: false }),
    // rolesMiddleware.grantAccess('updateOwn', 'profile'),
    vehicleController.createMakes
)

//admin only
// router.options('/:type/makes', cors(corsMiddleware.authedCors)) // enable pre-flights
router.put('/:type/makes',
    cors(corsMiddleware.authedCors),
    // passportMiddleware.authenticate('cookie', { session: false }),
    // rolesMiddleware.grantAccess('updateOwn', 'profile'),
    vehicleController.updateMakes
)


//admin only
router.options('/:type/models', cors(corsMiddleware.authedCors)) // enable pre-flights
router.post('/:type/models',
    cors(corsMiddleware.authedCors),
    passportMiddleware.authenticate('cookie', { session: false }),
    rolesMiddleware.grantAccess('updateOwn', 'profile'),
    vehicleController.createModels
)

// type : ["cars", "buses", "scooters", "campers", "motorcycles", "trucks"];
router.get('/:type/makes',
    cors(corsMiddleware.clientCors),
    vehicleController.getMakes
)

router.get('/:type/:makeID/models',
    cors(corsMiddleware.clientCors),
    vehicleController.getModelsByMake
)

// router.get('/del/:key',
//     cors(corsMiddleware.authedCors),
//     passportMiddleware.authenticate('cookie', { session: false }),
//     rolesMiddleware.grantAccess('updateOwn', 'profile'),
//     carsController.delCacheKey
// )

module.exports = router
