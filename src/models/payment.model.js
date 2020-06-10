const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const utils = require('../utils/functions')
const Errors = require('../utils/Errors')
const { uuid } = require('uuidv4')

const PaymentSchema = new mongoose.Schema({
    
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true,
        autopopulate: true
    },
    
    intent_id : {
        type : String,
        required : true
    }
})

PaymentSchema.plugin(require('mongoose-autopopulate'))

PaymentSchema.post('init', function (doc) {
    console.log('%s has been initialized from the db', doc._id)
})

PaymentSchema.post('remove', function (doc) {
    console.log('%s has been removed', doc._id)
})

PaymentSchema.virtual('id').get(function () {
    const user = this
    return user._id
})

// Export mongoose model
module.exports = mongoose.model('Payment', PaymentSchema)
