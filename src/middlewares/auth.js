function loginRequired (req, res, next) {
    if (req.user) {
        return next()
    }
    return res.redirect('/login')
}

function requireAdmin (req, res, next) {
    const isAdmin = req.user && req.user.role && req.user.role.toLowerCase() === 'Admin'.toLowerCase()
    if(isAdmin) return next()
    return res.status(403).send("Unauthorized")
}

function requireAdminOrSelf (req, res, next) {
    const isAdmin = req.user && req.user.role && req.user.role.toLowerCase() === 'Admin'.toLowerCase()
    const idMatch = req.body._id === req.user._id
    const usernameMatch = req.params.username === req.user.username
    if (isAdmin || idMatch || usernameMatch) return next()
    return res.status(403).send("Unauthorized")
}

module.exports = { loginRequired, requireAdmin, requireAdminOrSelf }
