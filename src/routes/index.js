const express = require('express')
const api = express.Router()
const CONFIG = require('../config/config');
const authRoutes = require('./auth.routes')
const usersRoutes = require('./users.routes')
const AnnouncesRoutes = require('./announce.routes')
const VehiclesRoutes = require('./vehicles.routes')
const VINDecoderRoutes = require('./vindecoder.routes')
const PlacesRoutes = require('./places.routes')
const DevRoutes = require('./dev.routes');

api.use('/auth', authRoutes)
api.use('/users', usersRoutes)
api.use('/ads', AnnouncesRoutes)
api.use('/vehicles', VehiclesRoutes)
api.use('/vindecoder', VINDecoderRoutes)
api.use('/places', PlacesRoutes)

if(CONFIG.isDev){
  api.use('/dev', DevRoutes)
}

module.exports = api
