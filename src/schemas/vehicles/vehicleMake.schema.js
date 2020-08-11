const mongoose = require('mongoose')

const MakeSchema = new mongoose.Schema({
  make: {
    type: String,
    trim: true,
    required: true
  },
  make_id : {
    type : Number,
    required: true,
    unique: true
  },
  make_idd: {
    type : Number,
  },
  make_ru: {
    type: String,
    trim: true
  },
  make_logo: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  strict: false
})

module.exports = MakeSchema
