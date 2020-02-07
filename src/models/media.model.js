const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: String,
  description: String,
  name: String,
  filename:String,
  directory:String,
  path:String,
  type: String,
  url: String,
  size: Number
});

mediaSchema.virtual('src').get(function () {
  return this.path;
});

mediaSchema.virtual('id').get(function() {
  return this._id;
});

// Export mongoose model
module.exports = mongoose.model('Media', mediaSchema);
