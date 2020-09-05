const mongoose = require('mongoose')
const config = require('../config/config')
const AnnounceModel = require('../models').Announce
const UserModel = require('../models').User
const Errors = require('../utils/Errors')
const Messages = require('../config/messages')
const functions = require('../utils/functions')
const prepareFilters = require('../components/filters/prepareFilters')
const announcesSorterMapper = require('../components/filters/announcesSorterMapper')
const AnnounceMailer = require('../components/mailer').announces
const DEFAULT_RESULTS_PER_PAGE = 10

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

exports.filterAnnouncesAction = (fetchProfile = false, fetchFeed = false, returnCount = false) => async (req, res, next) => {
    const { sort_by, sort_ord } = req.query
    const page = (req.query.page && parseInt(req.query.page) > 0) ? parseInt(req.query.page) : 1
    let size = DEFAULT_RESULTS_PER_PAGE
    let sorters = {
        createdAt: -1
    }
    
    const qSize = parseInt(req.query.size)
    if (qSize > 0 && qSize < 500) {
        size = qSize
    }
    
    const skip = (size * (page - 1) > 0) ? size * (page - 1) : 0
    
    //sorter
    if (sort_by) {
        const sortBy = announcesSorterMapper[sort_by]
        const sortOrder = sort_ord ? sort_ord === 'ASC' ? 1 : -1 : -1
        
        if(sortBy && sortOrder){
            sorters = {
                [sortBy]: sortOrder,
                ...sorters
            }
        }
    }
    
    let defaultQuery = {}
    
    //fetching single profile
    const user = req.query?.user?.toString() ?? req?.user?.id?.toString();
    const isSelf =  user && req?.user?.id?.toString() === user
    const isPro = Boolean(req.user.isPro || false)
    
    if(!isPro) defaultQuery.adType = {
        $ne : "sale-pro"
    }
    
    if(fetchProfile && user){
        defaultQuery = {
            ...defaultQuery,
            user,
        }
        
        //restrict to published announces
        if(!isSelf){
            defaultQuery = {
                ...defaultQuery,
                visible: true,
                activated: true,
                status: 'active' //enum['deleted', 'archived', 'active']
            }
        }
    }
    
    //fetch public announces
    else{
        //fetch user feed profiles
        if(fetchFeed){
            const followingIds = req?.user?.followings ? req.user.followings.map(following => following.user) : []
            if(followingIds.length !== 0) {
                defaultQuery = {
                    ...defaultQuery,
                    user: { $in: followingIds },
                }
            }
        }
        //search in all announces
        else {
            defaultQuery = {
                ...defaultQuery,
                visible: true,
                activated: true,
                status: 'active' //enum['deleted', 'archived', 'active']
            }
        }
    }
    
    let query = prepareFilters(req.query, defaultQuery)
    
    const { MAKE, MODEL } = req.query;
    let makesFilter = !Array.isArray(MAKE) ? [MAKE] : MAKE;
    let modelsFilter = !Array.isArray(MODEL) ? [MODEL] : MODEL;
    
    makesFilter = makesFilter
        .filter(make => typeof make === "string")
        .map(make => make.toLowerCase())
    
    modelsFilter = modelsFilter
        .filter(model => typeof model === "string")
        .map(model => model.toLowerCase())
    
    try {
        const rows = await AnnounceModel
        .find(query, '-damages')
        .skip(skip)
        .sort(sorters)
        .limit(size)
        .populate('images')
        .populate({
            path: 'manufacturer.make',
            // match: {
            //     make_slug : makesFilter
            // }
        })
        .populate({
            path: 'manufacturer.model',
        })
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
    
        const filtered = rows
        .filter(row => makesFilter.length ? makesFilter.includes(row.manufacturer?.make?.make_slug) : true)
        .filter(row => modelsFilter.length ? modelsFilter.includes(row.manufacturer?.model?.model) : true)
        
        const total = await AnnounceModel.find(query).count()
    
        const data = {
            page,
            size,
            query,
            pages: Math.ceil(total / size),
            total : filtered.length,
            rows : !returnCount ? filtered : null
        }
        
        return res.json({ success: true, data })
    } catch (err) {
        return next(err)
    }
}

exports.getAnnouncesByUserAction = async (req, res, next) => {
    const uid = req.params.uid
    const user = await UserModel.findById(uid)
    if (!user) return next(Errors.NotFoundError(Messages.errors.user_not_found))
    const announces = await AnnounceModel.findByUser(uid)
    return res.json({ success: true, data: announces })
}

exports.getAnnounceBySlugAction = async (req, res, next) => {
    try {
        const announce = await AnnounceModel
        .findOne({ slug: req.params.slug })
        .populate('user')
        .populate({
            path: 'comments',
            match: {
                enabled: true
            },
            populate: {
                path : 'user',
                select: 'avatarUrl firstname username lastname email'
            },
        })
        
        if (announce) {
            const isSelf = req.user ? req?.user.id.toString() === announce.user.id.toString() : false
            const isAdmin = req.user ? req.user.isAdmin : false
            
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
        return next(Errors.NotFoundError(Messages.errors.announce_not_found))
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
        return next(Errors.NotFoundError(Messages.errors.announce_not_found))
    } catch (err) {
        return next(err)
    }
}

exports.createAnnounceAction = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError(Messages.errors.user_not_found))
    
    const { vehicleType, manufacturer } = req.body
    
    //automatically disable announce
    const disable = req.user.garage.length >= req.user.config.garageLengthAllowed
    
    const modelMake = require('../models').Vehicles.Makes[`${vehicleType}s`]
    const modelModel = require('../models').Vehicles.Models[`${vehicleType}s`]
    let matchMake = null
    let matchModel = null
    
    try {
    
        if (modelMake && manufacturer?.make?.value){
            matchMake = await modelMake.findOne({
                _id : mongoose.Types.ObjectId(manufacturer?.make?.value)
            })
    
            if(modelModel && manufacturer?.year?.value){
                matchModel = await modelModel.findOne({
                    _id : mongoose.Types.ObjectId(manufacturer?.year?.value)
                })
            }
        }
        
        let data = {
            ...req.body,
            user: req.user,
            activated: false,
            visible: disable,
            makeRef : `${vehicleType}s_makes`,
            modelRef : `${vehicleType}s_models`,
            address : {
                ...req.body.address,
                housenumber : Number(req.body?.address?.housenumber ?? null)
            },
            manufacturer : {
                make : matchMake?._id,
                model : matchModel?._id
            }
        }
        
        const announce = new AnnounceModel(data)
        
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
    if (!req.user) return next(Errors.UnAuthorizedError(Messages.errors.user_not_found))
    
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
        'vehicleEngineType',
        'vehicleEngineGas',
        'vehicleEngineCylinder',
        'powerKm',
        'powerCh',
        'consumptionMixt',
        'consumptionCity',
        'consumptionRoad',
        'consumptionGkm',
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
        'address.postCode',
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
    if (!req.user) return next(Errors.UnAuthorizedError(Messages.errors.user_not_found))
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

exports.updateAdminAnnounceAction = async (req, res, next) => {
    const { slug } = req.params
    const activated = Boolean(req.body?.activated)
    if (!slug) return next(Errors.NotFoundError(Messages.errors.announce_not_found))
    
    try {
        const document = await AnnounceModel.findOneAndUpdate(
            { slug },
            { $set: req.body },
            {
                returnNewDocument: true,
                runValidators: true,
            })
        .populate('user')
        
        let emailResult = null
        if (activated) {
            //send activation success mail to announce owner
            emailResult = await AnnounceMailer.successConfirmAnnounce({
                title: document.title,
                email: document.user.email,
                firstname: document.user.firstname,
                lastname: document.user.lastname,
                announce_link: `${config.frontend}/announces/${document.slug}`,
                featured_img_link: document.images?.[0]?.location ?? 'https://kargain.s3.eu-west-3.amazonaws.com/uploads/2020/05/30670681-d44d-468e-bf82-533733bb507e.JPG',
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
                emailResult,
                // emailResult: emailResult ? {
                //     to: document.user.email
                // } : null
            },
        })
        
    } catch (err) {
        return next(err)
    }
}

exports.uploadImagesAction = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError(Messages.errors.user_not_found))
    if (!req.announce) return next(Errors.NotFoundError(Messages.errors.announce_not_found))
    
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
    if (!req.user) return next(Errors.UnAuthorizedError(Messages.errors.user_not_found))
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
    if (!req.user) return next(Errors.UnAuthorizedError(Messages.errors.user_not_found))
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
