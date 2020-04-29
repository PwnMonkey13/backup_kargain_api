const userModel = require('./user.model');
const announceModel = require('./announce.model');
const vehiclesMakes = require('./vehicles/vehicleMake.models');
const vehiclesModels = require('./vehicles/vehicleModel.models');
const mediaModel = require('./media.s3.model');
const commentModel = require('./comment.model');

module.exports = {
  User: userModel,
  Media: mediaModel,
  Comment : commentModel,
  Announce : announceModel,
  Vehicles : {
    Models : {...vehiclesModels},
    Makes : { ...vehiclesMakes}
  }
};
