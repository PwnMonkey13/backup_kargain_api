const User = require('../models').User
const functions = require('../utils/functions')

const getUsers = async (req, res, next) => {

  try {
    const page = (req.query.page && parseInt(req.query.page) > 0) ? parseInt(req.query.page) : 1
    const sort = (req.query.sort) ? { [req.query.sort]: 1 } : {}
    let size = 10

    if (req.query.size && parseInt(req.query.size) > 0 && parseInt(req.query.size) < 500) {
      size = parseInt(req.query.size)
    }

    const skip = (size * (page - 1) > 0) ? size * (page - 1) : 0

    const rows = await User.find().skip(skip).sort(sort).limit(size)
    const total = await User.estimatedDocumentCount().exec()

    const data = {
      page: page,
      pages: Math.ceil(total / size),
      total,
      size: size,
      sort: req.params.sort,
      rows
    }

    return res.json({ success: true, data })
  } catch (e) {
    next(e)
  }
}

const getUser = async (req, res, next) => {
  try {
    const username = req.params.username
    const user = await User.findOne({ username })
    if (!user) return next('No user found')
    else res.json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
}

const updateUser = (req, res, next) => {
  const filter = { username: req.params.username }
  const update = functions.convertToDotNotation(req.body)
  User.findOneAndUpdate(filter, update, { new: true })
    .then(updated => {
      return res.status(200).json({ success: true, data: updated })
    }).catch(next)
}

const deleteUser = async (req, res, next) => {
  const uid = req.params.uid
  User.deleteOne({ _id: uid }).then(document => {
    return res.json({ success: true, data: document })
  }).catch(next)
}

module.exports = { getUsers, getUser, updateUser, deleteUser }
