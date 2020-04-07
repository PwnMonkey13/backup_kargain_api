const mongoose = require('mongoose');
const utils = require('../utils/functions');
const AdresseSchema = require('../schemas/addresse.schema');
const { uuid, fromString } = require('uuidv4');

const AnnounceSchema = new mongoose.Schema({

	title : {
		type: String,
		trim: true,
		required: true
	},

	slug : {
		type: String,
		trim: true,
	},

	//sale, rent ...
	adType: {
		type: String,
		trim: true,
	},

	//car, moto etc ...
	vehicleType:{
		type: String,
		trim: true,
	},

	engine : {
		type : {
			type: { value : String, label : String},
			trim: true,
		},
		gas : {
			type: { value : String, label : String},
			trim: true,
		},
		cylinder : {
			type: { value : String, label : String},
			trim: true,
		}
	},
	mileage : {
		type: Number,
		trim: true,
	},

	price : {
		type: Number,
		trim: true,
	},

	user:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},

}, {
	timestamps: true,
	toJSON: { virtuals: true },
	strict: false
});

//hashing a password before saving it to the database
AnnounceSchema.pre('save', function(next) {
	const min = utils.stringToSlug(this.title);
	this.slug = `${min}-${fromString(min).substr(0, 6)}`;
	next();
});

// Export mongoose model
module.exports = mongoose.model('Announce', AnnounceSchema);
