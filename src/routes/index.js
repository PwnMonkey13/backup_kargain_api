const express = require('express')
const api = express.Router()
const authRoutes = require('./auth.routes')
const usersRoutes = require('./users.routes')

api.use('/auth', authRoutes)
api.use('/users', usersRoutes)


module.exports = api
