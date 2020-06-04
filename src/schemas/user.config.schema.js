const mongoose = require('mongoose')

const UserConfigSchema = new mongoose.Schema({
    garageLengthAllowed: {
        type: Number,
        default: 5
    },
    
    announceTagsMaxLength: {
        type: Number,
        default: 10
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    strict: false
})

module.exports = UserConfigSchema
