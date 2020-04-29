function loginRequired(req, res, next) {
    if (req.user) {
        return next();
    }
    return res.redirect('/login');
}

function requireAdmin (req, res, next) {
    if (req.user && req.user.role.toLowerCase() === 'Admin'.toLowerCase()) next()
    else return res.status(403).json({ message: 'Permission denied.' })
}

function requireAdminOrSelf (req, res, next) {
    const isAdmin = req.user && req.user.role && req.user.role.toLowerCase() !== 'Admin'.toLowerCase();
    const idMatch = req.body._id === req.user._id;
    const usernameMatch = req.params.username === req.user.username;
    if(isAdmin || idMatch || usernameMatch) next()
    else return res.status(403).json({ message: 'Permission denied.' })
}

module.exports = { loginRequired, requireAdmin, requireAdminOrSelf }
