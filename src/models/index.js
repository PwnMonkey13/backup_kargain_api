const User = require('./user.model')
const Announce = require('./announce.model')
const VehiclesMakesModels = require('./vehicles/vehicleMake.models')
const VehiclesModelModels = require('./vehicles/vehicleModel.models')
const Media = require('./media.s3.model')
const Comment = require('./comment.model')
const Payment = require('./payment.model')

module.exports = {
  User,
  Media,
  Comment,
  Announce,
  Payment,
  Vehicles: {
    Makes: { ...VehiclesMakesModels },
    Models: { ...VehiclesModelModels },
  }
}
