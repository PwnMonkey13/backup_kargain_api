const mongoose = require('mongoose')
const path = require('path')
const fs = require('fs')
const { promisify } = require("util");
const redisConfig = require('../../config/redis')
const utils = require('../../utils/functions')
const redisClient = redisConfig.redisClient
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

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
    const vehicleType = req.params.type
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
    const vehicleType = req.params.type
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
                        "make_id": Number(doc.make_id)
                    },
                    "$unset" : {
                        "make_idd" : 1
                    }
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
    const currentRoute = req.protocol + '://' + req.get('host') + req.originalUrl
    const url = utils.buildUrl(currentRoute, req.query)
    const { filter } = req.query
    const query = filter ? { make: { $in: filter.split(',') } } : {}
    
    const Model = require('../../models').Vehicles.Makes[vehicleType]
    if (!Model) return next('missing model')
    
    const cache = await redisConfig.getCacheKey(url)
    if (cache && cache.length !== 0){
        return res.json({
            success: true,
            msg: 'from redis',
            hostname: redisClient.address,
            count: cache.length,
            data: cache
        })
    }
    
    const makes = await Model.find(query).exec()
    redisClient.set(url, JSON.stringify(makes))
    return res.json({
        success: true,
        msg: 'from db',
        count: makes.length,
        data: makes,
    })
}

const getModelsByMake = async (req, res, next) => {
    const vehicleType = req.params.type
    const makeID = req.params.makeID
    const vehicleMakeModel = require('../../models').Vehicles.Makes[vehicleType]
    const vehicleModelsModel = require('../../models').Vehicles.Models[vehicleType]
    
    if (!vehicleMakeModel) return next('missing models model')
    if (!vehicleModelsModel) return next('missing make model')
    
    const currentRoute = req.protocol + '://' + req.get('host') + req.originalUrl
    const url = utils.buildUrl(currentRoute, req.query)
    const cache = await redisConfig.getCacheKey(url)
    if (cache && cache.length !== 0) return res.json({
        success: true,
        msg: 'from redis',
        hostname: redisClient.address,
        data: cache
    })
    const make = await vehicleMakeModel.findOne({ make_id: makeID })
    if(make){
        const models = await vehicleModelsModel.find({ make_id: mongoose.Types.ObjectId(make._id) })
        const data = { make, models }
        redisClient.set(url, JSON.stringify(data))
        return res.json({ success: true, msg: 'from db', data })
    } else return next('missing make')
}

module.exports = { bulkCars, createMakes, updateMakes, createModels, getMakes, getModelsByMake }
