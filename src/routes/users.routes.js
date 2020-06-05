const router = require('express').Router()
const cors = require('cors')
const corsMiddleware = require('../middlewares/cors.middleware')
const rolesMiddleware = require('../middlewares/roles.middleware')
const passportMiddleware = require('../middlewares/passport')
const authMiddleware = require('../middlewares/auth.middleware')
const usersController = require('../controllers/users.controller')
const uploadController = require('../controllers/upload.s3.controller')

router.get('/',
    cors(corsMiddleware.authedCors),
    passportMiddleware.authenticate('cookie', { session: false }),
    rolesMiddleware.grantAccess('readAny', 'profile'),
    usersController.getUsersAdminAction
)

router.get('/username/:username',
    cors(corsMiddleware.authedCors),
    authMiddleware.byPassAuth,
    usersController.getUserByUsername
)

router.options('/save', cors(corsMiddleware.authedCors)) // enable pre-flights
router.put('/save',
    cors(corsMiddleware.authedCors),
    passportMiddleware.authenticate('cookie', { session: false }),
    rolesMiddleware.grantAccess('updateOwn', 'profile'),
    usersController.saveAuthedUser
)

router.options('/save/username/:username', cors(corsMiddleware.authedCors)) // enable pre-flights
router.put('/save/username/:username',
    cors(corsMiddleware.authedCors),
    passportMiddleware.authenticate('cookie', { session: false }),
    //TODO resrict admin privilege
    rolesMiddleware.grantAccess('updateOwn', 'profile'),
    usersController.saveUserByUsername
)

router.options('/update', cors(corsMiddleware.authedCors)) // enable pre-flights
router.put('/update',
    cors(corsMiddleware.authedCors),
    passportMiddleware.authenticate('cookie', { session: false }),
    rolesMiddleware.grantAccess('updateOwn', 'profile'),
    usersController.updateUser
)

router.options('/upload/avatar', cors(corsMiddleware.authedCors)) // enable pre-flights
router.post('/upload/avatar',
    cors(corsMiddleware.authedCors),
    passportMiddleware.authenticate('cookie', { session: false }),
    uploadController.postObjects,
    usersController.uploadAvatar
)

router.options('/follow/:user_id', cors(corsMiddleware.authedCors)) // enable pre-flights
router.post('/follow/:user_id',
    cors(corsMiddleware.authedCors),
    passportMiddleware.authenticate('cookie', { session: false }),
    usersController.followUserAction
)

router.options('/unfollow/:user_id', cors(corsMiddleware.authedCors)) // enable pre-flights
router.post('/unfollow/:user_id',
    cors(corsMiddleware.authedCors),
    passportMiddleware.authenticate('cookie', { session: false }),
    usersController.unFollowUserAction
)

router.delete('/:uid',
    cors(corsMiddleware.authedCors),
    passportMiddleware.authenticate('cookie', { session: false }),
    rolesMiddleware.grantAccess('deleteAny', 'profile'),
    usersController.deleteUser
)

module.exports = router
