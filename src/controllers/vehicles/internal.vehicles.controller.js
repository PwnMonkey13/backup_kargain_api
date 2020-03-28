const utils = require('../../utils/functions')
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
  const Model = require('../../models').Vehicles.Makes[vehicleType]
  if(!Model) return res.json({ success: false, msg: "missing model" });

  const currentRoute = req.protocol + '://' + req.get('host') + req.originalUrl;
  const url = utils.buildUrl(currentRoute, req.query)

  const { filter } = req.query;
  const query = filter ? {"make" : { $in : filter.split(',') }} : {};
  const makes = await Model.find(query);

  return res.json({ success: true, url, data : makes })
}


const getModelsByMake = async (req, res, next) => {
  const vehicleType = req.params.type;
  const makeName = req.params.make;

  const currentRoute = req.protocol + '://' + req.get('host') + req.originalUrl
  const url = utils.buildUrl(currentRoute, req.query)

  const modelMake = require('../../models').Vehicles.Makes[vehicleType]
  const ModelModel = require('../../models').Vehicles.Models[vehicleType];

  if(!modelMake) return res.json({ success: false, msg: "missing models model" });
  if(!ModelModel) return res.json({ success: false, msg: "missing make model" });

  const make = await modelMake.find({ make : makeName })

  if(make){
    ModelModel.find({}, (err, models) => {
      if(err) throw err;
      return res.json({ success: true, url, data : { make, models }})
    })
  }
}

// redisConfig.getCacheKey(url).then(data => {
//   if (data) return res.json({ success: true, msg: 'from redis', hostname: redisClient.address, data })
//   else {
//     fetchApi(url).then(data => {
//       redisClient.set(url, JSON.stringify(data))
//       return res.json({ success: true, msg: 'from API', data })
//     }).catch(next)
//   }
// });

module.exports = { createMakes, getMakes, getModelsByMake }
