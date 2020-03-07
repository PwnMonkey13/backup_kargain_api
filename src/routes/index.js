const express = require('express')
const api = express.Router()
const authRoutes = require('./auth.routes')
const usersRoutes = require('./users.routes')
const AnnouncesRoutes = require('./announce.routes')
const VehiclesRoutes = require('./vehicles.routes')

api.use('/auth', authRoutes)
api.use('/users', usersRoutes)
api.use('/ads', AnnouncesRoutes)
api.use('/vehicles', VehiclesRoutes)

module.exports = api
