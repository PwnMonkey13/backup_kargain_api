const express = require('express')
const cors = require('cors')
const routes = express.Router()
const passportMiddleware = require('../middlewares/passport')
const paymentController = require('../controllers/payments.controller')
const corsMiddleware = require('../middlewares/cors.middleware')

routes.get('/secret/:intent_id',
    cors(corsMiddleware.authedCors),
    passportMiddleware.authenticate('cookie', { session: false }),
    paymentController.getIntent
)


routes.post('/new',
    cors(corsMiddleware.authedCors),
    passportMiddleware.authenticate('cookie', { session: false }),
    paymentController.createPayment
)

routes.post('/charge',
    paymentController.postCharge
)


module.exports = routes
