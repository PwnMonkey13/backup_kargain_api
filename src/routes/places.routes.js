const express = require('express')
const routes = express.Router()
const cors = require('cors')
const wideCors = require('../config/cors').wideCors
const PlacesController = require('../controllers/places.controller')

//https://api-adresse.data.gouv.fr/
routes.get('/adresses-gouv', cors(wideCors), PlacesController.fetchGouvAdressesAPI)

routes.get('/vicopo/:query', cors(wideCors), PlacesController.fetchVicopoAPI)


//https://geo.api.gouv.fr
// routes.get('/communes', cors(corsConfig(false, true)), AdresseGouvController.fetchCities)
//
// routes.get('/communes/:code', cors(corsConfig(false, true)), AdresseGouvController.fetchSingleCities)
//
// routes.get('/departements', cors(corsConfig(false, true)), AdresseGouvController.fetchDepartments)
//
// routes.get('/departements/:code', cors(corsConfig(false, true)), AdresseGouvController.fetchSingleDepartment)
//
// routes.get('/departements/:code/communes', cors(corsConfig(false, true)), AdresseGouvController.fetchCitiesByDepartment)
//
// routes.get('/regions', cors(corsConfig(false, true)), AdresseGouvController.fetchRegions)
//
// routes.get('/regions/:code', cors(corsConfig(false, true)), AdresseGouvController.fetchSingleRegion)
//
// routes.get('/regions/:code/communes', cors(corsConfig(false, true)), AdresseGouvController.fetchCitiesByRegion)

module.exports = routes
