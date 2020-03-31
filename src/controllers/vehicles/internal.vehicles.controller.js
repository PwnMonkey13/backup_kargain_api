const utils = require('../../utils/functions')
const mongoose = require('mongoose')
const redisConfig = require('../../config/redis')
const redisClient = redisConfig.redisClient

const createMakes = (req, res, next) => {
  const vehicleType = req.params.type;
  const model = require('../../models').Vehicles.Makes[vehicleType];

  if(!model) return res.json({ success: false, msg: "missing model" });
  model.insertMany(req.body)
    .then(docs => {
      return res.json({ success: true, msg: `${docs.length} inserted` })
    })
    .catch(next)
}

const getMakes = async (req, res, next) => {
  const vehicleType = req.params.type;
  const Model = require('../../models').Vehicles.Makes[vehicleType];
  if(!Model) return res.json({ success: false, msg: "missing model" });

  const currentRoute = req.protocol + '://' + req.get('host') + req.originalUrl;
  const url = utils.buildUrl(currentRoute, req.query)
  const cached = await redisConfig.getCacheKey(url);
  if (cached) return res.json({ success: true, msg: 'from redis', hostname: redisClient.address, data : cached })

  const { filter } = req.query;
  const query = filter ? {"make" : { $in : filter.split(',') }} : {};
  const makes = await Model.find(query).exec();
  redisClient.set(url, JSON.stringify(makes))
  return res.json({ success: true, msg : 'from db', data : makes});
}

const getModelsByMake = async (req, res, next) => {
  const vehicleType = req.params.type;
  const makeName = req.params.make;
  const vehicleMake_model = require('../../models').Vehicles.Makes[vehicleType]
  const vehicleModels_model = require('../../models').Vehicles.Models[vehicleType];

  if(!vehicleMake_model) return res.json({ success: false, msg: "missing models model" });
  if(!vehicleModels_model) return res.json({ success: false, msg: "missing make model" });

  const currentRoute = req.protocol + '://' + req.get('host') + req.originalUrl
  const url = utils.buildUrl(currentRoute, req.query)

  const cached = await redisConfig.getCacheKey(url);
  if (cached) return res.json({ success: true, msg: 'from redis', hostname: redisClient.address, data : cached })

  const make = await vehicleMake_model.findOne({ make : makeName }).exec();
  const models = await vehicleModels_model.find({make_id : mongoose.Types.ObjectId(make._id)}).exec();
  const data = { make, models };
  redisClient.set(url, JSON.stringify(data))
  return res.json({ success: true, msg : 'from db', data })
}

module.exports = { createMakes, getMakes, getModelsByMake }
