const UserModel = require('../models').User
const AnnounceModel = require('../models').Announce
const functions = require('../utils/functions')
const Errors = require('../utils/Errors')

const getUsersAdminAction = async (req, res, next) => {
    const page = (req.query.page && parseInt(req.query.page) > 0) ? parseInt(req.query.page) : 1
    let size = 50
    
    let sorters = {
        createdAt: -1
    }
    
    if (req.query.size && parseInt(req.query.size) > 0 && parseInt(req.query.size) < 500) {
        size = parseInt(req.query.size)
    }
    
    const skip = (size * (page - 1) > 0) ? size * (page - 1) : 0
    
    try {
        const total = await UserModel.estimatedDocumentCount().exec()
        const rows = await UserModel
        .find({}, '-location -favorites')
        .skip(skip)
        .sort(sorters)
        .limit(size)
        
        const data = {
            page: page,
            pages: Math.ceil(total / size),
            total,
            size: size,
            rows,
        }
        return res.json({ success: true, data })
    } catch (err) {
        return next(err)
    }
}

const getUserByUsername = async (req, res, next) => {
    const username = req.params.username
    const self = req.user && req.user.username === username
    const garageFilters = !self ? {
        activated: true,
        visible: true,
        status: 'active'
    } : {}
    
    try {
        const user = await UserModel.findOne({ username })
        .populate({
            path: 'favorites',
            populate: 'comments',
            match: garageFilters
        })
        .populate({
            path: 'garage',
            populate: 'user comments',
            match: garageFilters
        })
        
        if (!user) return next(Errors.NotFoundError('user not found'))
        
        return res.json({
            success: true,
            data: user
        })
    } catch (err) {
        next(err)
    }
}

const saveAuthedUser = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError('missing user'))
    try {
        const doc = await req.user.save()
        return res.status(200).json({ success: true, data: doc })
    } catch (err) {
        next(err)
    }
}

const saveUserByUsername = async (req, res, next) => {
    try {
        const user = await UserModel.findOne({ username: req.params.username })
        if (!user) return next('missing user')
        const doc = await user.save()
        return res.status(200).json({ success: true, data: doc })
    } catch (err) {
        next(err)
    }
}

const updateUser = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError('missing user'))
    
    const allowedFieldsUpdatesSet = [
        'firstname',
        'lastname',
        'about',
        'phone',
        'company.name',
        'company.siren',
        'company.owner',
        'countrySelect',
        'socials.facebook',
        'socials.twitter',
        'address.fullAddress',
        'address.housenumber',
        'address.street',
        'address.postalcode',
        'address.city',
    ]
    
    const updatesSet = allowedFieldsUpdatesSet.reduce((carry, key) => {
        const value = functions.resolveObjectKey(req.body, key)
        if (value) return { ...carry, [key]: value }
        else return carry
    }, {})
    
    try {
        const doc = await UserModel.updateOne(
            {
                _id: req.user.id
            },
            {
                $set: updatesSet,
            },
            {
                returnNewDocument: true,
                runValidators: true
            }
        )
        return res.status(200).json({ success: true, data: doc })
    } catch (err) {
        return next(err)
    }
}

const uploadAvatar = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError('missing user'))
    req.user.avatar = req.uploadedFiles?.avatar?.[0]
    
    try {
        const document = await req.user.save()
        return res.json({ success: true, data: document })
    } catch (err) {
        next(err)
    }
}

const deleteUser = async (req, res, next) => {
    const uid = req.params.uid
    UserModel.deleteOne({ _id: uid }).then(document => {
        return res.json({ success: true, data: document })
    }).catch(next)
}

const addFavoriteAnnounceAction = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError('missing user'))
    const { announce_id: announceId } = req.params
    const announce = await AnnounceModel.findById(announceId)
    
    if (!announce) return next('can\'t find matching announce')
    if (req.user.id.toString() === announce.user.toString()) return next('can\'t fave your own announce')
    
    try {
        const insertion = await UserModel.updateOne(
            {
                _id: req.user.id
            },
            {
                $addToSet: {
                    favorites: announceId
                }
            },
            {
                runValidators: true
            }
        )
        
        return res.json({
            success: true,
            message: 'favorite added successfully',
            data: insertion
        })
    } catch (err) {
        return next(err)
    }
}

const rmFavoriteAnnounceAction = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError('missing user'))
    const { announce_id: announceId } = req.params
    const announce = await AnnounceModel.findById(announceId)
    if (!announce) return next('can\'t find matching announce')
    
    try {
        const suppression = await UserModel.updateOne(
            { _id: req.user.id },
            {
                $pull: {
                    favorites: announceId
                }
            },
            {
                runValidators: true
            }
        )
        
        return res.json({
            success: true,
            message: 'favorite deleted successfully',
            data: suppression
        })
    } catch (err) {
        return next(err)
    }
}

const followUserAction = async (req, res, next) => {
    const { user_id: userId } = req.params
    if (!req.user) return next(Errors.UnAuthorizedError('missing user'))
    if (req.user.id.toString() === userId) return next('can\'t like yourself')
    
    try {
        const insertion = await UserModel.updateOne(
            { _id: userId },
            {
                $addToSet: {
                    followers: {
                        user: req.user.id
                    }
                }
            },
            {
                runValidators: true
            }
        )
        
        if (insertion) {
            const doc = await UserModel.updateOne(
                { _id: userId },
                {
                    $addToSet: {
                        followings: {
                            user: userId
                        }
                    }
                })
            
            return res.json({
                success: true,
                message: 'follower added successfully',
                data: {
                    doc,
                    insertion
                }
            })
        } else throw ('user not found')
    } catch (err) {
        return next(err)
    }
}

const unFollowUserAction = async (req, res, next) => {
    const { user_id: userId } = req.params
    if (!req.user) return next(Errors.UnAuthorizedError('missing user'))
    if (req.user.id.toString() === userId) return next('can\'t like yourself')
    
    try {
        const suppression = await UserModel.updateOne(
            { _id: userId },
            {
                $pull: {
                    followers: {
                        user: req.user.id
                    }
                }
            },
            {
                runValidators: true
            }
        )
        
        if (suppression) {
            const doc = await UserModel.updateOne(
                { _id: req.user.id },
                {
                    $pull: {
                        followings: {
                            user: userId
                        }
                    }
                }
            )
            
            return res.json({
                success: true,
                message: 'follower deleted successfully',
                data: {
                    doc,
                    suppression
                }
            })
        } else throw ('user not found')
    } catch (err) {
        return next(err)
    }
}

module.exports = {
    getUsersAdminAction,
    getUserByUsername,
    updateUser,
    uploadAvatar,
    saveAuthedUser,
    saveUserByUsername,
    deleteUser,
    addFavoriteAnnounceAction,
    rmFavoriteAnnounceAction,
    followUserAction,
    unFollowUserAction,
}
