
const router = require('express').Router()
const passportAuth = require('../middlewares/passport');
const auth = require('../middlewares/auth');
const usersController = require('../controllers/users.controller')

router.use(passportAuth.authenticate('jwt', { session: false }));

router.get('/',
  // auth.requireAdmin,
  usersController.getUsers);
// users?page=${page}&size=${size}

router.put('/:id_user', auth.requireAdminOrSelf, usersController.updateUser);

router.get('/:id_user', usersController.getUser)

router.delete('/:id_user', usersController.deleteUser)

module.exports = router
