const mongoose = require('mongoose')
const path = require('path')
const fs = require('fs')
const slugify = require('@sindresorhus/slugify')
const { promisify } = require("util")
const redisConfig = require('../../config/redis')
const utils = require('../../utils/functions')
const redisClient = redisConfig.redisClient
const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)
const htmlDir = "C:\\Users\\Niko_PC\\Downloads\\cars\\json"
const debugDir = "C:\\Users\\Niko_PC\\Downloads\\cars"

const asyncFilter = async (arr, predicate) => {
    const results = await Promise.all(arr.map(predicate))
    return arr.filter((_v, index) => results[index])
}

const bulkCars = async (req, res, next) => {
    const files = fs.readdirSync(htmlDir);
    const modelMake = require('../../models').Vehicles.Makes["cars"]
    const modelModel = require('../../models').Vehicles.Models["cars"]
    if (!modelMake) throw 'missing model'
    if (!modelModel) throw 'missing model'
    
    let makes = 0
    let models = 0
    let start = new Date()
    
    const asyncForEach = async (array, callback) => {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array)
        }
    }
    try{
        await asyncForEach(files, async (file) => {
            const filePath = path.resolve(`${htmlDir}\\${file}`);
            const doc = await readFileAsync(filePath, 'utf8');
            const json = JSON.parse(doc);
        
            await asyncForEach(json, async (row) => {
                const {
                    make,
                    make_id,
                    make_ru,
                    ...rest
                } = row
            
                let makeId;
                const match = await modelMake.findOne({ make })
            
                if (!match) {
                    const docMake = new modelMake({
                        make,
                        make_id,
                        make_ru
                    })
                    await docMake.save()
                    makeId = docMake._id
                    makes += 1
                } else makeId = match._id
    
                console.log(file)
                
                const { trim_ru, model, generation, drive, engine_type } = rest
                const matchModel = await modelModel.findOne({
                    trim_ru,
                    model,
                    generation,
                    drive,
                    engine_type
                })
    
                if(!matchModel){
                    const docModel = new modelModel({
                        ...rest,
                        make_id  : makeId
                    })
                    const doc = await docModel.save()
                    console.log(doc)
                    models += 1
                }
            })
        })
    
        let end = (new Date() - start)/1000/60/60;
        console.log("end process")
        
        return res.json({
            makes,
            models,
            log : `Execution time: ${end} hours`
        })
    }catch (err){
        const time = Date.now()
        await writeFileAsync(debugDir + "/" + `debug_${time}.log`, JSON.stringify(err), "utf8");
    }
}

const createMakes = async (req, res, next) => {
    const vehicleType = req.params.vehicleType
    const modelMake = require('../../models').Vehicles.Makes[vehicleType]
    if (!modelMake) return next('missing model')
    
    const entries = await asyncFilter(req.body, async (entry) => {
        const match = await modelMake.findOne({ make: entry.make })
        // if (!match) {
        //     const { make, make_id, make_ru } = entry
        //     const doc = new modelMake({
        //         make, make_id, make_ru
        //     })
        //     return await doc.save()
        // }
        if (match){
            match.make_id = entry.make_id
            const doc = await match.save()
            console.log(doc)
            console.log("updated")
        }
    })
    
    return res.json({
        success: true,
        count: entries.length,
        entries
    })
}

const updateMakes = async (req, res, next) => {
    const vehicleType = req.params.vehicleType
    const modelMake = require('../../models').Vehicles.Makes[vehicleType]
    if (!modelMake) return next('missing model')
    
    const makes = await modelMake.find({});
    
    try{
        const entries = await makes.reduce(async (accPromise, doc) => {
            const acc = await accPromise
            const updated = await modelMake.updateOne(
                { _id: doc._id},
                {
                    "$set": {
                        // "make_id": Number(doc.make_id),
                        "make_slug" : slugify(doc.make)
                    },
                    // "$unset" : {
                    //     "make_idd" : 1
                    // }
                })
        
            return [...acc, updated]
        }, Promise.resolve([]))
    
        return res.json({
            success: true,
            entries,
        })
    }
  catch (err){
    return next(err)
  }
}

const createModels = async (req, res, next) => {
    const vehicleType = req.params.type
    const modelModel = require('../../models').Vehicles.Models[vehicleType]
    const makeModel = require('../../models').Vehicles.Makes[vehicleType]
    
    if (!modelModel) return next('missing model')
    if (!makeModel) return next('missing model')
    
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
    const vehicleType = req.params.vehicleType
    const forceRewriteCache = Boolean(req.query.forceRewriteCache);
    const { filter } = req.query
    const query = filter ? { make: { $in: filter.split(',') } } : {}
    
    try {
        const cacheKey = `${vehicleType}_makes`
        const cache = await redisConfig.getCacheKey(cacheKey)
    
        if (cache && !forceRewriteCache){
            return res.json({
                success: true,
                msg: 'from redis',
                hostname: redisClient.address,
                data: cache
            })
        }
    
        const makeModel = require('../../models').Vehicles.Makes[vehicleType]
        if (!makeModel) return next('missing model')
    
        const makes = await makeModel.find(query)
        redisClient.set(cacheKey, JSON.stringify(makes))
        return res.json({
            success: true,
            msg: 'from db',
            data: makes
        })
    } catch (err){
        return next(err)
    }
}

const getModelsByMake = async (req, res, next) => {
    const vehicleType = req.params.vehicleType
    const make = req.query.make;
    const forceRewriteCache = Boolean(req.query.forceRewriteCache);
    
    if (!make) return next('missing make name')
    
    try {
        const cacheKey = `${vehicleType}_${make}_models`
        const cache = await redisConfig.getCacheKey(cacheKey)
    
        if (cache && !forceRewriteCache){
            return res.json({
                success: true,
                msg: 'from redis',
                hostname: redisClient.address,
                data: cache
            })
        }
    
        const vehicleMakeModel = require('../../models').Vehicles.Makes[vehicleType]
        const vehicleModelsModel = require('../../models').Vehicles.Models[vehicleType]
    
        if (!vehicleMakeModel) return next('missing make model')
        if (!vehicleModelsModel) return next('missing models model')
        
        const makeDoc = await vehicleMakeModel.findOne({ make_slug : slugify(make)})
        if (!makeDoc) return next('missing make')
    
        const models = await vehicleModelsModel.find({ make_id: mongoose.Types.ObjectId(makeDoc._id) })
        
        redisClient.set(cacheKey, JSON.stringify(models))
        return res.json({
            success: true,
            msg: 'from db',
            data : models
        })
        
    } catch (err){
        return next(err)
    }
}

const getCarsModelsByMake = async (req, res, next) => {
    const make = req.query.make;
    const carsMakesModel = require('../../models').Vehicles.Makes['cars']
    const forceRewriteCache = Boolean(req.query.forceRewriteCache);
    const cacheKey = `cars_${make}`
    
    if (!make) return next('missing make')
    
    try{
        const cache = await redisConfig.getCacheKey(cacheKey)
    
        if (cache && !forceRewriteCache){
            return res.json({
                success: true,
                msg: 'from redis',
                hostname: redisClient.address,
                data: cache
            })
        }
    
        const makeDoc = await carsMakesModel.findOne({ make_slug : slugify(make)})
        if(!makeDoc) return next('missing make')
        
        let db = mongoose.connection;
        const aggregateModels = await db.db.command({
            distinct: "cars_models",
            key: "model",
            query: { make_id : mongoose.Types.ObjectId(makeDoc._id)}
        })
    
        redisClient.set(cacheKey, JSON.stringify(aggregateModels))
        return res.json({
            success: true,
            data : aggregateModels
        })
        
    } catch (err){
        return next(err)
    }
};

const getCarsModelTrims = async (req, res, next) => {
    const { make, model } = req.query
    const carsMakesModel = require('../../models').Vehicles.Makes['cars']
    const forceRewriteCache = Boolean(req.query.forceRewriteCache);
    
    if (!make) return next('missing make')
    if (!model) return next('missing model')
    
    try {
        const cacheKey = `cars_${make}_${model}_trims`
        const cache = await redisConfig.getCacheKey(cacheKey)
        
        if (cache && !forceRewriteCache){
            return res.json({
                success: true,
                msg: 'from redis',
                hostname: redisClient.address,
                data: cache
            })
        }
        
        const makeDoc = await carsMakesModel.findOne({ make_slug : slugify(make)})
        if (!makeDoc) return next('missing make')
        
        let db = mongoose.connection;
        const aggregateTrims = await db.db.command({
            distinct: "cars_models",
            key: "trim",
            query: {
                make_id : mongoose.Types.ObjectId(makeDoc._id),
                model : model
            }
        })
        
        return res.json({
            success: true,
            data: aggregateTrims,
        })
    } catch (err) {
        return next(err)
    }
}

const getCarsModelTrimYears = async (req, res, next) => {
    const { make, model, trim } = req.query
    const carsModelsModel = require('../../models').Vehicles.Models['cars']
    const forceRewriteCache = Boolean(req.query.forceRewriteCache);
    
    if (!make) return next('missing make')
    if (!model) return next('missing model')
    
    try {
        const cacheKey = `cars_${make}_${model}_${trim}_years`
        const cache = await redisConfig.getCacheKey(cacheKey)
    
        if (cache && !forceRewriteCache){
            return res.json({
                success: true,
                msg: 'from redis',
                hostname: redisClient.address,
                data: cache
            })
        }
    
        const trimsYears = await carsModelsModel.find(
            {trim},
            {year : 1})
        
        return res.json({
            success: true,
            data: trimsYears,
        })
    } catch (err) {
        return next(err)
    }
}

module.exports = {
    bulkCars,
    createMakes,
    updateMakes,
    createModels,
    getMakes,
    getModelsByMake,
    getCarsModelsByMake,
    getCarsModelTrims,
    getCarsModelTrimYears
}
