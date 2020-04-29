const express = require('express')
const routes = express.Router()
const passportAuth = require('../middlewares/passport');
const commentController = require('../controllers/comments.controller')
const AuthMiddleware = require('../middlewares/auth')

routes.get('/:announce_id', commentController.getCommentsByAnnounce)

routes.post('/', commentController.createComment)

routes.put('/enable/:comment_id',
    passportAuth.authenticate('jwt', { session: false }),
    AuthMiddleware.requireAdminOrSelf,
    commentController.enableComment)

routes.put('/disable/:comment_id',
    passportAuth.authenticate('jwt', { session: false }),
    AuthMiddleware.requireAdminOrSelf,
    commentController.disableComment)

module.exports = routes
