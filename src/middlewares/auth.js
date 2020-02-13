const getRole = (req, res, next) => {
  return req.user.role
}

function requireAdmin (req, res, next) {
  if (req.user) {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Permission denied.' })
    }
    next()
  }
}

function requireAdminOrSelf (req, res, next) {
  if (req.user) {
    if (req.user.role !== 'Admin' ||
      req.body._id === req.user._id ||
      req.params.username === req.user.username) {
      return res.status(403).json({ message: 'Permission denied.' })
    }
    next()
  }
}

module.exports = { requireAdmin, requireAdminOrSelf }
