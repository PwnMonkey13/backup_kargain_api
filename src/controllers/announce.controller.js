const config = require('../config/config')
const AnnounceModel = require('../models').Announce
const UserModel = require('../models').User
const Errors = require('../utils/Errors')
const functions = require('../utils/functions')
const moment = require('moment')
const announcesFiltersMapper = require('../utils/announcesFiltersMapper')
const announcesSorterMapper = require('../utils/announcesSorterMapper')
const AnnounceMailer = require('../components/mailer').announces
const DEFAULT_RESULTS_PER_PAGE = 10

exports.cron = async (req, res, next) => {
    const twoMonthsAgo = moment().subtract(1, 'months')
    
    try {
        const docs = await AnnounceModel.find({
            visible: false,
            'createdAt': {
                $lt: twoMonthsAgo.toDate()
            }
        }).populate('user')
        
        await Promise.all(docs.map(async (doc) => {
            doc.visible = false
            await doc.save()
            return doc
        }))
        
        const emails = docs.map(doc => doc?.user?.email).filter(email => email != null)
        
        const emailsResults = await Promise.all(docs.map(async (doc) => {
            return await AnnounceMailer.informDisabledAnnounce({
                email: doc?.user?.email,
                announce_title: doc.title,
                announce_link: `${config.frontend}/announces/${doc.slug}`,
                announce_creation_date: moment(doc.createdAt).format('dddd, MMMM Do YYYY, h:mm:ss a')
            })
        }))
        
        return res.status(400).json({ docs, emails, emailsResults })
        
    } catch (err) {
        return next(err)
    }
}

exports.find = async (req, res, next) => {
    const twoMonthsAgo = moment().subtract(1, 'months')
    const docs = await AnnounceModel.find({
        visible: true,
        'createdAt': {
            $lte: twoMonthsAgo.toDate()
        }
    }, {
        visible: false,
    }, {
        ret
    })
    return res.status(400).json({ len: docs.length, docs })
}

exports.getAnnouncesAdminAction = async (req, res, next) => {
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
        const rows = await AnnounceModel
        .find({}, '-damages')
        .skip(skip)
        .sort(sorters)
        .limit(size)
        .populate({
            path: 'user',
            select: '-followings -followers -favorites -garage'
        })
        
        const total = await AnnounceModel
        .find()
        .estimatedDocumentCount()
        
        const data = {
            pages: Math.ceil(total / size),
            page,
            total,
            size,
            rows
        }
        
        return res.json({ success: true, data })
    } catch (err) {
        return next(err)
    }
}

exports.getAnnouncesAction = async (req, res, next) => {
    const { coordinates, enableGeocoding, radius } = req.query
    let size = DEFAULT_RESULTS_PER_PAGE
    const page = (req.query.page && parseInt(req.query.page) > 0) ? parseInt(req.query.page) : 1
    let sorters = {
        createdAt: -1
    }
    
    if (req.query.sort_by) {
        const sortBy = announcesSorterMapper[req.query.sort_by]
        const sortOrder = req.query.sort_ord ? req.query.sort_ord === 'ASC' ? 1 : -1 : -1
        sorters = {
            [sortBy]: sortOrder,
            ...sorters
        }
    }
    
    if (req.query.size && parseInt(req.query.size) > 0 && parseInt(req.query.size) < 500) {
        size = parseInt(req.query.size)
    }
    
    const skip = (size * (page - 1) > 0) ? size * (page - 1) : 0
    
    const filters = Object.keys(announcesFiltersMapper).reduce((carry, key) => {
        const match = Object.keys(req.query).find(prop => prop === key)
        if (match) {
            return {
                ...carry,
                [key]: {
                    ...announcesFiltersMapper[key],
                    value: req.query[key]
                }
            }
        } else return carry
    }, {})
    
    let defaultQuery = {
        visible: true,
        activated: true,
        status: 'active' //enum['deleted', 'archived', 'active']
    }
    
    let query = Object.keys(filters).reduce((carry, key) => {
        const filter = filters[key]
        if (typeof filter === 'object') {
            
            if (!carry[filter.ref]) carry[filter.ref] = {}
            
            if (filter.type === 'range') {
                const values = filter.value.split(',')
                const min = Number(values[0])
                const max = Number(values[1])
                
                if (!filter.disable) {
                    if (min) carry[filter.ref]['$gte'] = min
                    if (max) {
                        if (filter.maxDisable && max < filter.maxDisable) {
                            carry[filter.ref]['$lte'] = max
                        } else carry[filter.ref]['$lte'] = max
                    }
                }
            } else if (typeof filter.value === 'string') {
                if (filter.rule === 'strict') {
                    carry[filter.ref] = filter.value.toLowerCase()
                } else {
                    carry[filter.ref] = {
                        $regex: filter.value,
                        $options: 'i'
                    }
                }
            }
        }
        return carry
    }, defaultQuery)
    
    if (enableGeocoding && Array.isArray(coordinates) && radius) {
        query = {
            ...query,
            'location': {
                $near: {
                    $geometry:
                        {
                            type: 'Point',
                            coordinates: [
                                coordinates[0],
                                coordinates[1]
                            ]
                        },
                    $maxDistance: radius * 1000
                }
            }
        }
    }
    
    try {
        const rows = await AnnounceModel
        .find(query, '-damages')
        .skip(skip)
        .sort(sorters)
        .limit(size)
        // .lean()
        .populate('images')
        .populate({
            path: 'user',
            select: '-followings -followers -favorites -garage'
        })
        .populate({
            path: 'comments',
            select: '-announce -responses -likes',
            populate: {
                path: 'user',
                select: '-followings -followers -favorites -garage'
            }
        })
        
        const total = await AnnounceModel
        .find(query)
        .estimatedDocumentCount()
        
        const data = {
            query,
            sorters,
            pages: Math.ceil(total / size),
            page,
            total,
            size,
            rows
        }
        
        return res.json({ success: true, data })
    } catch (err) {
        return next(err)
    }
}

exports.getAnnouncesByUserAction = async (req, res, next) => {
    const uid = req.params.uid
    const user = await UserModel.findById(uid)
    if (!user) return next('No user found')
    const announces = await AnnounceModel.findByUser(uid)
    if (announces) return res.json({ success: true, data: announces })
    else return res.status(400).json({ success: false, msg: 'no announces found', uid })
}

exports.getAnnounceBySlugAction = async (req, res, next) => {
    try {
        const announce = await AnnounceModel
        .findOne({ slug: req.params.slug })
        .populate('user')
        .populate('comments')
        .populate(
            {
                path: 'likes',
                populate: {
                    path: 'user',
                    // select: 'firstname lastname username avatar avatarUrl, email role pro'
                },
            })
        
        if (announce) {
            const isSelf = req?.user.id.toString() === announce.user.id.toString()
            const isAdmin = req?.user?.isAdmin
            
            if (isAdmin || isSelf) return res.json({
                success: true,
                data: {
                    announce,
                    isSelf,
                    isAdmin
                }
            })
            
            const displayAd =
                announce.activated &&
                announce.visible &&
                announce.status === 'active'
            
            if (displayAd) return res.json({
                success: true,
                data: {
                    announce,
                }
            })
        }
        return next(Errors.NotFoundError('no announce found'))
    } catch (err) {
        return next(err)
    }
}

exports.getBySlugAndNextAction = async (req, res, next) => {
    try {
        const announce = await AnnounceModel.findOne({ slug: req.params.slug })
        if (announce) {
            req.announce = announce
            return next()
        }
        return next(Errors.NotFoundError('no announce found'))
    } catch (err) {
        return next(err)
    }
}

exports.createAnnounceAction = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError('missing user'))
    const max = req.user.config.garageLengthAllowed ?? 5
    
    //automatically disable announce
    const disable = req.user.garage.length >= req.user.config.garageLengthAllowed
    
    try {
        const announce = new AnnounceModel({
            ...req.body,
            user: req.user,
            activated: false,
            visible: disable
        })
        
        const document = await announce.save()
        await UserModel.updateOne(
            { _id: req.user.id },
            {
                $addToSet: {
                    garage: document._id
                }
            }
        )
        
        await AnnounceMailer.confirmCreateAnnounce({
            email: req.user.email,
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            announce_link: `${config.frontend}/announces/${document.slug}`,
            featured_img_link: document.images?.[0]?.location ?? 'https://kargain.s3.eu-west-3.amazonaws.com/uploads/2020/05/30670681-d44d-468e-bf82-533733bb507e.JPG',
            manufacturer: {
                make: document?.manufacturer?.make?.label,
                model: document?.manufacturer?.model?.label,
                generation: document?.manufacturer?.generation?.label,
            }
        })
        
        return res.json({
            success: true,
            data: document
        })
    } catch (err) {
        next(err)
    }
}

exports.updateAnnounceAction = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError('missing user'))
    
    const allowedFieldsUpdatesSet = [
        'title',
        'showCellPhone',
        'visible',
        'description',
        'price',
        'vehicleFunctionType',
        'vehicleFunctionUse',
        'vehicleGeneralState',
        'vehicleFunction',
        'vehicleEngine.type',
        'vehicleEngine.gas',
        'vehicleEngine.cylinder',
        'power.km',
        'power.ch',
        'consumption.mixt',
        'consumption.city',
        'consumption.road',
        'consumption.gkm',
        'mileage',
        'equipments',
        'damages',
        'doors',
        'seats',
        'driverCabins',
        'bunks',
        'beds',
        'bedType',
        'paint',
        'materials',
        'externalColor',
        'internalColor',
        'emission',
        'images',
        'tags',
        'address.fullAddress',
        'address.housenumber',
        'address.street',
        'address.postalcode',
        'address.country',
        'address.city'
    ]
    
    const updatesSet = allowedFieldsUpdatesSet.reduce((carry, key) => {
        const value = functions.resolveObjectKey(req.body, key)
        if (value) return { ...carry, [key]: value }
        else return carry
    }, {})
    
    try {
        const doc = await AnnounceModel.updateOne(
            { slug: req.params.slug },
            { $set: updatesSet },
            {
                returnNewDocument: true,
                runValidators: true,
                context: 'query'
            }
        )
        return res.status(200).json({ success: true, data: doc })
    } catch (err) {
        return next(err)
    }
}

exports.removeAnnounceAction = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError('missing user'))
    try {
        const doc = await AnnounceModel.updateOne(
            { slug: req.params.slug },
            { $set: { status: 'deleted' } },
            {
                returnNewDocument: true,
                runValidators: true,
                context: 'query'
            }
        )
        return res.status(200).json({ success: true, data: doc })
    } catch (err) {
        return next(err)
    }
}

exports.confirmAnnounceAdminAction = async (req, res, next) => {
    const { slug, approve } = req.params
    const approved = approve ?? true
    if (!slug) return next('missing announce slug in token')
    
    try {
        const updates = {
            $set: {
                activated: approved,
                status: approved ? 'active' : 'rejected'
            }
        }
        
        const document = await AnnounceModel.findOneAndUpdate(
            { slug },
            updates,
            {
                returnNewDocument: true,
                runValidators: true,
            })
        
        let emailResult = null
        if (approved) {
            //send activation success mail to announce owner
            emailResult = await AnnounceMailer.successConfirmAnnounce({
                email: document.user.email,
                firstname: document.user.firstname,
                lastname: document.user.lastname,
                announce_link: `${config.frontend}/announces/${document.slug}`,
                featured_img_link: document.images?.[0]?.location ?? 'https://kargain.s3.eu-west-3.amazonaws.com/uploads/2020/05/30670681-d44d-468e-bf82-533733bb507e.JPG',
                manufacturer: {
                    make: document?.manufacturer?.make?.label,
                    model: document?.manufacturer?.model?.label,
                    generation: document?.manufacturer?.generation?.label,
                }
            })
        } else {
            //send rejected activation mail to announce owner
            emailResult = await AnnounceMailer.rejectedConfirmAnnounce({
                email: document.user.email,
                firstname: document.user.firstname,
                lastname: document.user.lastname,
                announce_link: `${config.frontend}/announces/${document.slug}`,
            })
        }
        
        return res.json({
            success: true,
            data: {
                document,
                emailResult
            },
        })
        
        return res.json({ success: true, data: document })
    } catch (err) {
        return next(Errors.AlreadyActivated('Activation token expired'))
    }
}

exports.uploadImagesAction = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError('missing user'))
    if (!req.announce) return next(Errors.NotFoundError('no announce found'))
    
    const announce = req.announce
    
    if (req.uploadedFiles && req.uploadedFiles.images && req.uploadedFiles.images.length !== 0) {
        if (!announce.images) announce.images = []
        announce.images = [...announce.images, ...req.uploadedFiles.images]
    }
    
    try {
        const document = await announce.save()
        return res.json({ success: true, data: document })
    } catch (err) {
        next(err)
    }
}

exports.addUserLikeActionAction = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError('missing user'))
    const { announce_id } = req.params
    try {
        const insertionLike = await AnnounceModel.updateOne(
            { _id: announce_id },
            { $addToSet: { likes: { user: req.user.id } } },
            { runValidators: true }
        )
        const insertionFavorite = await UserModel.updateOne(
            { _id: req.user.id },
            { $addToSet: { favorites: announce_id } },
            { runValidators: true }
        )
        return res.json({
            success: true,
            message: 'like added successfully',
            data: {
                insertionLike,
                insertionFavorite
            }
        })
    } catch (err) {
        return next(err)
    }
}

exports.removeUserLikeActionAction = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError('missing user'))
    const { announce_id } = req.params
    try {
        const suppressionLike = await AnnounceModel.updateOne(
            { _id: announce_id },
            { $pull: { likes: req.user.id } },
            { runValidators: true }
        )
        const suppressionFavorite = await UserModel.updateOne(
            { _id: req.user.id },
            { $pull: { favorites: announce_id } },
            { runValidators: true }
        )
        return res.json({
            success: true,
            data: {
                suppressionLike,
                suppressionFavorite
            }
        })
    } catch (err) {
        return next(err)
    }
}
