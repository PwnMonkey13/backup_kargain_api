const mongoose = require('mongoose');

const AdresseSchema = new mongoose.Schema({
  address : {
    street : {
      type: String,
      trim: true,
    },
    postalcode : {
      type: String,
      trim: true,
    },
    city : {
      type: String,
      trim: true,
    },
    country : {
      type: String,
      trim: true,
    },
  },
});

module.exports = AdresseSchema;
