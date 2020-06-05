const config = require('../config/config')
const AnnounceModel = require('../models').Announce
const UserModel = require('../models').User
const Errors = require('../utils/Errors')
const functions = require('../utils/functions')
const announcesFiltersMapper = require('../utils/announcesFiltersMapper')
const announcesSorterMapper = require('../utils/announcesSorterMapper')
const AnnounceMailer = require('../components/mailer').announces
const DEFAULT_RESULTS_PER_PAGE = 10

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
        .skip(skip)
        .limit(size)
        .count()
        
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

exports.getAnnouncesAllAction = async (req, res, next) => {
    try {
        const page = (req.query.page && parseInt(req.query.page) > 0) ? parseInt(req.query.page) : 1
        let size = 5
        const sorters = { createdAt: -1 }
        
        if (req.query.size && parseInt(req.query.size) > 0 && parseInt(req.query.size) < 500) {
            size = parseInt(req.query.size)
        }
        const skip = (size * (page - 1) > 0) ? size * (page - 1) : 0
        
        const query = {}
        
        const rows = await AnnounceModel
        .find(query)
        .skip(skip)
        .sort(sorters)
        .limit(size)
        .populate('user')
        
        const total = await AnnounceModel.estimatedDocumentCount().exec()
        
        const data = {
            page: page,
            pages: Math.ceil(total / size),
            total,
            size: size,
            rows
        }
        
        return res.json({ success: true, data })
    } catch (e) {
        throw e
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
        
        if (!announce) return next(Errors.NotFoundError('no announce found'))
        
        if (req.user) {
            if (req.user.role === 'admin') {
                return res.json({ success: true, data: announce })
            }
            
            if (req.user.id.toString() === announce.user.id.toString()) {
                return res.json({ success: true, data: announce })
            }
        }
        
        const displayAd =
            announce.activated &&
            announce.visible &&
            announce.status === 'active'
        
        if (displayAd) return res.json({ success: true, data: announce })
        
        return next(Errors.NotFoundError('no announce found'))
    } catch (err) {
        return next(err)
    }
}

exports.getByIdAndNextAction = (method = 'GET') => async (req, res, next) => {
    let announceId = method === 'GET' ? req.params.announce_id : req.body.announce_id
    
    try {
        const announce = await AnnounceModel.findById(announceId)
        if (announce) {
            req.announce = announce
            return next()
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
    
    if (req.user.garage.length > max) {
        return next('max announces limit reached')
    }
    
    try {
        const announce = new AnnounceModel({
            ...req.body,
            user: req.user
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
        
        const emailResult = await AnnounceMailer.confirmCreateAnnounce({
            email: req.user.email,
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            announce_link : `${config.frontend}/slug/${document.slug}`,
            featured_img_link : document.images?.[0]?.location ?? "https://kargain.s3.eu-west-3.amazonaws.com/uploads/2020/05/30670681-d44d-468e-bf82-533733bb507e.JPG",
            manufacturer : {
                make : document?.manufacturer?.make?.label,
                model : document?.manufacturer?.model?.label,
                generation : document?.manufacturer?.generation?.label,
            }
        })
        
        return res.json({
            success: true,
            data: {
                document,
                emailResult
            },
        })
    } catch (err) {
        next(err)
    }
}

exports.updateAnnounceAction = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError())
    
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
        if(approved){
            //send activation success mail to announce owner
            emailResult = await AnnounceMailer.successConfirmAnnounce({
                email: document.user.email,
                firstname: document.user.firstname,
                lastname: document.user.lastname,
                announce_link : `${config.frontend}/slug/${document.slug}`,
                featured_img_link : document.images?.[0]?.location ?? "https://kargain.s3.eu-west-3.amazonaws.com/uploads/2020/05/30670681-d44d-468e-bf82-533733bb507e.JPG",
                manufacturer : {
                    make : document?.manufacturer?.make?.label,
                    model : document?.manufacturer?.model?.label,
                    generation : document?.manufacturer?.generation?.label,
                }
            })
        } else{
            //send rejected activation mail to announce owner
            emailResult = await AnnounceMailer.rejectedConfirmAnnounce({
                email: document.user.email,
                firstname: document.user.firstname,
                lastname: document.user.lastname,
                announce_link : `${config.frontend}/slug/${document.slug}`,
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

const toggleUserLike = async (req, res, next) => {
    const { announce_id: announceId } = req.params
    if (!req.user) return next(Errors.UnAuthorizedError())
    
    try {
        const announce = await AnnounceModel.findById(announceId)
        if (!announce) return next('announce not found')
        
        const foundUser = announce.likes.find(like => like.user.toString() === req.user.id.toString())
        
        if (!foundUser) {
            announce.likes.push({
                user: req.user.id
            })
        } else {
            const index = announce.likes.findIndex(like => like.user === req.user.id)
            announce.likes.splice(index, 1)
        }
        
        const doc = await announce.save()
        return res.json({ success: true, message: 'like added successfully', data: doc.likes.length })
    } catch (err) {
        return next(err)
    }
}
