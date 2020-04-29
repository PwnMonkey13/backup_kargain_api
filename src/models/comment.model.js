const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
  announce_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Announce'
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  message : {
    type : String,
    trim : true,
  },
  enabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
});

// Export mongoose model
module.exports = mongoose.model('Comment', CommentSchema)
