const AnnounceModel = require('../models').Announce
const UserModel = require('../models').User

const proceedSearchAction = async (req, res, next) => {
    const { q: searchQuery } = req.query
    
    const page = (req.query.page && parseInt(req.query.page) > 0) ? parseInt(req.query.page) : 1
    let size = 5
    
    if (req.query.size && parseInt(req.query.size) > 0 && parseInt(req.query.size) < 500) {
        size = parseInt(req.query.size)
    }
    
    const skip = (size * (page - 1) > 0) ? size * (page - 1) : 0
    
    try {
        const query = {
            $text: { $search: searchQuery || '' }
        }
        
        const rows = await AnnounceModel
        .find(query)
        .skip(skip)
        .limit(size)
        .populate('user')
    
        const total = await AnnounceModel
        .find(query)
        .estimatedDocumentCount()
        
        const users = await UserModel
        .find(query,
            "lastname firstname username avatarUrl"
        )
        .limit(50)
        
        const data = {
            users,
            announces : {
                total,
                page,
                size,
                rows,
            },
        }
        return res.json({ success: true, message: 'comment fetch successfully', data })
    } catch (err) {
        return next(err)
    }
    
}

module.exports = {
    proceedSearchAction
}
