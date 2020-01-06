const User = require('../models').User;

const getUsers = async (req, res, next) => {
  try {
    const page = (req.query.page && parseInt(req.query.page) > 0) ? parseInt(req.query.page) : 1
    const sort = (req.query.sort) ? { [req.query.sort]: 1 } : {}
    let size = 10
    if (req.query.size && parseInt(req.query.size) > 0 && parseInt(req.query.size) < 500) {
      size = parseInt(req.query.size)
    }
    const skip = (size * (page - 1) > 0) ? size * (page - 1) : 0

    const response = {
      users: [],
      page: page,
      size: size,
      sort: req.params.sort,
      total: 0
    }

    if (req.params.sort) response.sort = req.params.sort

    const users = await User
      .find()
      .skip(skip)
      .sort(sort)
      .limit(size)

    response.users = users
    response.total = users.length
    return res.json(response)
  }catch (e) {
    next(e);
  }
}

const getUser = async (req, res, next) => {
  try {
    const uid = req.params.id_user;
    const user = await User.findOne({ _id: uid })
    if (!user) return next('Unable to fetch profile');
    else res.json({ success: true, data : user});
  } catch (err) {
    next(err)
  }
}

const updateUser = (req, res, next) => {
  const uid = req.params.id_user;
  User.findByIdAndUpdate(uid, req.body)
    .then(data => {
      return res.status(200).json({ success: true, data: data });
    }).catch(next);
}

const deleteUser = async (req, res, next) => {
  try {
    const uid = req.params.id_user;
    User.deleteOne({ _id: uid }).then(document => {
      return res.json({ success: true, data: document })
    }).catch(err => next(err))
  } catch (err) {
    next(err)
  }
}

module.exports = { getUsers, getUser, updateUser, deleteUser }
