const utils = require('../../utils/functions')
const mongoose = require('mongoose')
const redisConfig = require('../../config/redis')
const redisClient = redisConfig.redisClient

const createMakes = async (req, res, next) => {
    const vehicleType = req.params.type
    const modelMake = require('../../models').Vehicles.Makes[vehicleType]
    if (!modelMake) return res.json({ success: false, msg: 'missing model' })
    
    const asyncFilter = async (arr, predicate) => {
        const results = await Promise.all(arr.map(predicate))
        return arr.filter((_v, index) => results[index])
    }
    
    const entries = await asyncFilter(req.body, async (entry) => {
        const match = await modelMake.findOne({ make: entry.make })
        if (!match) {
            const { make, make_id, make_ru } = entry
            const doc = new modelMake({
                make, make_id, make_ru
            })
            return await doc.save()
        }
    })
    
    return res.json({
        success: true,
        count: entries.length,
        entries
    })
    
    // .then(docs => {
    //     return res.json({ success: true, msg: `${docs.length} inserted` })
    // })
    // .catch(next)
}

const createModels = async (req, res, next) => {
    const vehicleType = req.params.type
    const modelModel = require('../../models').Vehicles.Models[vehicleType]
    const makeModel = require('../../models').Vehicles.Makes[vehicleType]
    
    if (!modelModel) return res.json({ success: false, msg: 'missing model' })
    if (!makeModel) return res.json({ success: false, msg: 'missing model' })
    
    const entries = await req.body.reduce(async (accPromise, entry) => {
        const acc = await accPromise
        const { model, make_id, model_id, model_ru } = entry
        const makeMatch = await makeModel.findOne({ _id: make_id })
        const matchModel = await modelModel.findOne({ model })
        if (!matchModel && makeMatch) {
            const newModel = new modelModel({
                model,
                make_id: makeMatch._id,
                model_id,
                model_ru
            })
            const doc = await newModel.save()
            return [...acc, doc]
        } else return [...acc, { makeMatch, matchModel }]
    }, Promise.resolve([]))
    
    return res.json({
        success: true,
        count: entries.length,
        entries
    })
}

const getMakes = async (req, res, next) => {
    const vehicleType = req.params.type
    const Model = require('../../models').Vehicles.Makes[vehicleType]
    if (!Model) return res.json({ success: false, msg: 'missing model' })
    const currentRoute = req.protocol + '://' + req.get('host') + req.originalUrl
    const url = utils.buildUrl(currentRoute, req.query)
    const cache = await redisConfig.getCacheKey(url)
    if (cache && cache.length !== 0) return res.json({
        success: true,
        msg: 'from redis',
        hostname: redisClient.address,
        count: cache.length,
        data: cache
    })
    const { filter } = req.query
    const query = filter ? { make: { $in: filter.split(',') } } : {}
    const makes = await Model.find(query).exec()
    redisClient.set(url, JSON.stringify(makes))
    return res.json({
        success: true,
        msg: 'from db',
        count: makes.length,
        data: makes,
    })
}

const getModels = async (req, res, next) => {
    const vehicleType = req.params.type
    const Model = require('../../models').Vehicles.Models[vehicleType]
    if (!Model) return res.json({ success: false, msg: 'missing model' })
    // const currentRoute = req.protocol + '://' + req.get('host') + req.originalUrl
    // const url = utils.buildUrl(currentRoute, req.query)
    // const cache = await redisConfig.getCacheKey(url)
    // if (cache && cache.length !== 0) return res.json({
    //     success: true,
    //     msg: 'from redis',
    //     hostname: redisClient.address,
    //     count: cache.length,
    //     data: cache
    // })
    // const { filter } = req.query
    // const query = filter ? { make: { $in: filter.split(',') } } : {}
    // const makes = await Model.find(query).skip(900).limit(100).populate('make_id').exec()
    // redisClient.set(url, JSON.stringify(makes))
    
    const models = await Model.find().skip(3309).limit(200)
    
    return res.json({
        success: true,
        msg: 'from db',
        count: models.length,
        data: models,
    })
}

const getModelsByMake = async (req, res, next) => {
    const vehicleType = req.params.type
    const makeName = req.params.make
    const vehicleMakeModel = require('../../models').Vehicles.Makes[vehicleType]
    const vehicleModelsModel = require('../../models').Vehicles.Models[vehicleType]
    
    if (!vehicleMakeModel) return res.json({ success: false, msg: 'missing models model' })
    if (!vehicleModelsModel) return res.json({ success: false, msg: 'missing make model' })
    
    const currentRoute = req.protocol + '://' + req.get('host') + req.originalUrl
    const url = utils.buildUrl(currentRoute, req.query)
    const cache = await redisConfig.getCacheKey(url)
    if (cache && cache.length !== 0) return res.json({
        success: true,
        msg: 'from redis',
        hostname: redisClient.address,
        data: cache
    })
    
    const make = await vehicleMakeModel.findOne({ make: makeName }).exec()
    const models = await vehicleModelsModel.find({ make_id: mongoose.Types.ObjectId(make._id) }).exec()
    const data = { make, models }
    redisClient.set(url, JSON.stringify(data))
    return res.json({ success: true, msg: 'from db', data })
}

module.exports = { createMakes, createModels, getMakes, getModels, getModelsByMake }
