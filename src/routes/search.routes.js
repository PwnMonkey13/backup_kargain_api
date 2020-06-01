const express = require('express')
const routes = express.Router()
const searchController = require('../controllers/search.controller')

routes.get('/',
    searchController.proceedSearchAction
)

module.exports = routes
