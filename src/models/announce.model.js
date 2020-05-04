const mongoose = require('mongoose')
const utils = require('../utils/functions')
const shortid = require('shortid')

const AnnounceSchema = new mongoose.Schema({
    
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: true
    },
    
    title: {
        type: String,
        trim: true,
        required: true
    },
    
    content: {
        type: String,
        trim: true
    },
    
    active: {
        type: Boolean,
        default: false
    },
    
    publish: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    
    status: {
        type: String,
        enum: ['archived', 'deleted', 'pending', 'done'],
        default: 'pending'
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
        default: 0
    },
    
    // sale, rent ...
    adType: {
        label: String,
        value: String
    },
    
    // car, moto etc ...
    vehicleType: {
        label: String,
        value: String
    },
    
    // citadine, cabriolet, etc ...
    vehicleFunctionUse: {
        label: String,
        value: String
    },
    
    // neuf, occas
    vehicleGeneralState: {
        label: String,
        value: String
    },
    
    // taxi, personal
    vehicleFunction: {
        label: String,
        value: String
    },
    
    vehicleEngine: {
        engine: {
            label: String,
            value: String
        },
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
    
    mileage: {
        type: Number,
        default: 0
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
            label: String,
            value: String
        }
    ],
    
    ownersCount: {
        label: String,
        value: String
    },
    doors: {
        label: String,
        value: String
    },
    seats: {
        label: String,
        value: String
    },
    
    paint: {},
    materials: {},
    externalColor: {},
    internalColor: {},
    emission: {},
    
    description: {
        type: String,
        trim: true,
    },
    
    damages: [
        {
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
    
    location: {
        city: {
            type: String,
            trim: true
        },
        
        postalcode: {
            type: String,
            trim: true
        }
    },
    
    featuredImg: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        autopopulate: true
    },
    
    images: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        autopopulate: true
    }],
    
    tags: [
        {
            name: String
        }
    ],
    
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
            autopopulate: true
        }
    ]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    strict: false
})

AnnounceSchema.plugin(require('mongoose-autopopulate'));

// hashing a password before saving it to the database
AnnounceSchema.pre('save', function (next) {
    const date = new Date()
    const titleLower = utils.stringToSlug(this.title)
    this.slug = `${titleLower}-${shortid.generate()}`
    this.expirationDate = new Date(date.setMonth(date.getMonth() + 1))
    next()
})

AnnounceSchema.statics.findByUser = async function (uid) {
    return await this.model('Announce').find({ user: uid }).exec()
}

// Export mongoose model
module.exports = mongoose.model('Announce', AnnounceSchema)
