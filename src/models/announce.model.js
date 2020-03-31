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

	adType: {
		type: String,
		trim: true,
		required: true
	},

	vehicleType:{
		type: String,
		trim: true,
		required: true
	},

	engine : {
		type : {
			type: String,
			trim: true,
		},
		gas : {
			type: String,
			trim: true,
		},
		cylinder : {
			type: String,
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

	currency : {
		type: Number,
		trim: true,
	},

	doors : {
		type: Number,
		trim: true,
	},

	seats : {
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
