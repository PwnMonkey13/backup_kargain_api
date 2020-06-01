const mongoose = require('mongoose')

const UserConfigSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    
    garageLengthAllowed: {
        type: Number,
        default: 5
    },
    
    announceTagsMaxLength : {
        type : Number,
        default : 10
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    strict: false
})

// Export mongoose model
module.exports = mongoose.model('ConfigUser', UserConfigSchema)
