const mongoose = require('mongoose')
const shortid = require('shortid')
const LikeSchema = require('./like.schema')
const utils = require('../utils/functions')

const AnnounceSchema = new mongoose.Schema({
    
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // autopopulate: { maxDepth: 1 }
    },
    
    title: {
        type: String,
        trim: true,
        required: true
    },
    
    showCellPhone: {
        type: Boolean,
        default: true,
    },
    
    //need admin validation
    activated: {
        type: Boolean,
        default: false
    },
    
    //draft mode
    visible: {
        type: Boolean,
        default: true,
    },
    
    status: {
        type: String,
        enum: ['rejected', 'deleted', 'archived', 'active'],
        default: 'active'
    },
    
    description: {
        type: String,
        trim: true,
    },
    
    expirationDate: {
        type: Date
    },
    
    slug: {
        type: String,
        trim: true
    },
    
    price: {
        type: Number,
        default: 0,
        min: 0,
        max: 999999
    },
    
    vinNumber: String,
    
    // sale, rent ...
    adType: {
        type: String,
        required: true
    },
    
    // car, moto etc ...
    vehicleType: {
        type: String,
        required: true
    },
    
    // e:g moto => quad, scooter ...
    vehicleFunctionType: {
        label: String,
        value: String
    },
    
    // neuf, occas
    vehicleGeneralState: {
        label: String,
        value: String
    },
    
    // personal, taxi, driving-school ...
    vehicleFunctionUse: {
        label: String,
        value: String
    },
    
    // taxi, personal
    vehicleFunction: {
        label: String,
        value: String
    },
    
    vehicleEngine: {
        type: {
            label: String,
            value: String
        },
        gas: {
            label: String,
            value: String
        },
        cylinder: {
            type: { value: String, label: String },
            trim: true
        }
    },
    
    manufacturer: {
        make: {
            label: String,
            value: String
        },
        model: {
            label: String,
            value: String
        },
        generation: {
            label: String,
            value: String
        },
        year: {
            label: String,
            value: String
        }
    },
    
    mileage: {
        type: Number,
        default: 0,
        min: 0,
        max: 999999
    },
    
    power: {
        km: {
            type: Number,
            default: 0
        },
        ch: {
            type: Number,
            default: 0
        },
    },
    
    consumption: {
        mixt: {
            type: Number,
            default: 0
        },
        city: {
            type: Number,
            default: 0
        },
        road: {
            type: Number,
            default: 0
        },
        gkm: {
            type: Number,
            default: 0
        },
    },
    
    equipments: [
        {
            _id: false,
            label: String,
            value: String
        }
    ],
    
    ownersCount: {
        label: String,
        value: String,
    },
    
    damages: [
        {
            _id: false,
            position: {
                left: Number,
                top: Number
            },
            text: {
                type: String,
                trim: true
            }
        }
    ],
    
    doors: {
        label: String,
        value: String
    },
    
    seats: {
        label: String,
        value: String
    },
    
    driverCabins: {
        label: String,
        value: String
    },
    
    bunks: {
        label: String,
        value: String
    },
    
    beds: {
        label: String,
        value: String
    },
    
    bedType: {
        label: String,
        value: String
    },
    
    paint: {},
    materials: {},
    externalColor: {},
    internalColor: {},
    emission: {},
    
    location: {
        coordinates: {
            type: [Number],
            default: [0, 0], //long, lat
        },
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
    },
    
    countrySelect: {
        label: String,
        value: String
    },
    
    address: {
        housenumber: Number,
        street: {
            type: String,
            trim: true
        },
        postalcode: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        fullAddress: {
            type: String,
            trim: true
        }
    },
    
    images: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        autopopulate: true
    }],
    
    tags: [{
        index: true,
        _id: false,
        type: String
    }],
    
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        }
    ],
    
    likes: [LikeSchema],
    
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: {
        virtuals: true,
    },
    strict: false
})

AnnounceSchema.path('tags').validate((arr) => {
    return arr.length <= 10
}, 'too much tags provided')

AnnounceSchema.index({
    // title: 'text',
    // description: 'text',
    // content: 'text',
    // tags : 'text'
    '$**': 'text'
})

AnnounceSchema.index({ location: '2dsphere' })

// AnnounceSchema.plugin(require('mongoose-explain'));
AnnounceSchema.plugin(require('mongoose-autopopulate'))

// hashing a password before saving it to the database
AnnounceSchema.pre('save', function (next) {
    if (this.isNew) {
        const announce = this
        const date = new Date()
        const adType = announce.adType?.value?.toLowerCase()
        const vehicleType = announce.vehicleType?.value?.toLowerCase()
        const titleParts = [
            adType,
            vehicleType,
            this.title,
            shortid.generate()
        ].join(' ')
        this.slug = utils.stringToSlug(titleParts)
        this.expirationDate = new Date(date.setMonth(date.getMonth() + 1))
    }
    next()
})

AnnounceSchema.post('update', function (doc) {
    console.log('Update finished.')
})

AnnounceSchema.statics.findByUser = async function (uid) {
    return await this.model('Announce').find({ user: uid }).exec()
}

AnnounceSchema.virtual('id').get(function () {
    const announce = this
    return announce._id
})

AnnounceSchema.virtual('priceHT').get(function () {
    const announce = this
    return Number(announce.price * 0.8).toFixed(0)
})

module.exports = AnnounceSchema
