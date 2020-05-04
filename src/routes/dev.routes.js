const express = require('express')
const routes = express.Router()
const devController = require('../controllers/dev.controller')

routes.post('/bulk-insert/:vehicle', devController.bulkInsert)

module.exports = routes
