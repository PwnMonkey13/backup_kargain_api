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

	active:{
		type: Boolean,
		default: false,
	},

	status:{
		type: String,
		enum : ["archived", "deleted", "pending", "done"],
		default : 'pending'
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

	//citadine, cabriolet, etc ...
	vehicleFunctionUse:{
		type: String,
		trim: true,
	},

	//neuf, occas
	vehicleGeneralState : {
		type: String,
		trim: true,
	},

	//taxi, personal
	vehicleFunction : {
		type: String,
		trim: true,
	},

	vehicleEngine : {
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

	location : {
		city : {
			type: String,
			trim: true,
		},

		postalcode: {
			type: String,
			trim: true,
		}
	},

	user:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},

	featured_thumbnail : {
		type: String
	},

	// featured_thumbnail : {
	// 	type: mongoose.Schema.Types.ObjectId,
	// 	ref: 'Media'
	// }
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
