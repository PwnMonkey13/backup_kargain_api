const vehicleSchema = require("../schemas/vehicles/vehicleModel.schema");
const mongoose = require('mongoose');
const Airtable = require('airtable')

const bulkInsert = (req, res, next) => {
  const data = req.body;
  const vehicleType = req.params.vehicle;
  const vehicleTypeCapitalized = vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)
  const model = mongoose.model(vehicleTypeCapitalized, vehicleSchema);

  model.insertMany(data)
    .then(function(docs) {
        return res.json({ success: true, msg: `${docs.length} inserted` })
    })
    .catch(next);
}

const testAirTable = (req, res, next) => {
  const AirTable = require('airtable');
  const base = new AirTable({apiKey: 'key9AYMKfuKxT9Asd'}).base('appd6P7GXekeqmV2A');

  base('Design projects').select({
    view: 'All projects',
    maxRecords: 5,
    // filterByFormula: 'AND(Days > 5, Visited)',
    fields: ['Name', 'Category'],
    sort: [
      {field: 'Name', direction: 'desc'},
    ],
  }).firstPage(function(err, records) {
    if (err) return next(err);
    return res.json({ success: true, data : records })
  });
}

module.exports = { bulkInsert, testAirTable }
