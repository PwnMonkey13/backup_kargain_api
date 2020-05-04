const express = require('express')
const cors = require('cors')
const routes = express.Router()
const passportAuth = require('../middlewares/passport')
const commentController = require('../controllers/comments.controller')
const AuthMiddleware = require('../middlewares/auth')
const corsMiddleware = require('../config/cors')

routes.get('/:announce_id', commentController.getCommentsByAnnounce)

routes.post('/',
    cors(corsMiddleware.authedCors),
    passportAuth.authenticate('cookie', { session: false }),
    AuthMiddleware.requireAdminOrSelf,
    commentController.createComment
)

routes.put('/enable/:comment_id',
    cors(corsMiddleware.authedCors),
    passportAuth.authenticate('cookie', { session: false }),
    AuthMiddleware.requireAdminOrSelf,
    commentController.enableComment
)

routes.put('/disable/:comment_id',
    cors(corsMiddleware.authedCors),
    passportAuth.authenticate('cookie', { session: false }),
    AuthMiddleware.requireAdminOrSelf,
    commentController.disableComment
)

module.exports = routes
