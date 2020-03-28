const mongoose = require('mongoose');
const vehicleMakeSchema = require("../../schemas/vehicles/vehicleMake.schema");
const names = ["buses", "scooters", "campers", "motorcycles", "trucks"];

const models = names.reduce((carry, name) => {
  return {...carry, [name] : mongoose.model(`${name}_makes`, vehicleMakeSchema)};
},{});

module.exports = models;
