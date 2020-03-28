const userModel = require('./user.model');
const announceModel = require('./announce.model');
const vehiclesMakes = require('./vehicles/vehicleMake.models');
const vehiclesModels = require('./vehicles/vehicleModel.models');

module.exports = {
  User: userModel,
  Announce : announceModel,
  Vehicles : {
    Models : {...vehiclesModels},
    Makes : { ...vehiclesMakes}
  }
};
