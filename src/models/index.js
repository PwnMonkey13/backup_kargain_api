const User = require('./user.model')
const Announce = require('./announce.model')
const VehiclesMakesModels = require('./vehicles/vehicleMake.models')
const VehiclesModelModels = require('./vehicles/vehicleModel.models')
const Media = require('./media.s3.model')
const Comment = require('./comment.model')
const UserConfig = require('./user.config.model')

module.exports = {
  User,
  UserConfig,
  Media,
  Comment,
  Announce,
  Vehicles: {
    Makes: { ...VehiclesMakesModels },
    Models: { ...VehiclesModelModels },
  }
}
