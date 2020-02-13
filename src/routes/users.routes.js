
const router = require('express').Router()
const passportAuth = require('../middlewares/passport');
const auth = require('../middlewares/auth');
const usersController = require('../controllers/users.controller')

// router.use(passportAuth.authenticate('jwt', { session: false }));

router.get('/',
  // auth.requireAdmin,
  usersController.getUsers);
// users?page=${page}&size=${size}

router.put('/:username',
  passportAuth.authenticate('jwt', { session: false }),
  // auth.requireAdminOrSelf,
  usersController.updateUser);

router.get('/:username', usersController.getUser)

router.delete('/:uid', usersController.deleteUser)

module.exports = router
