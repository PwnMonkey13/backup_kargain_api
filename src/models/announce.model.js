const mongoose = require('mongoose');
const utils = require('../utils/functions');
const { uuid, fromString } = require('uuidv4');

const AnnounceSchema = new mongoose.Schema({
	
	user:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	
	title : {
		type: String,
		trim: true,
		required: true
	},
	
	content : {
		type: String,
		trim: true,
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
	
	expirationDate:{
		type: Date,
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

	featured_thumbnail : {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Media'
	},
	
	images : [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Media'
	}],
	
	tags : [
		{
			name : String
		}
	],
	
	comments : [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Comment'
		}
	]
}, {
	timestamps: true,
	toJSON: { virtuals: true },
	strict: false
});

//hashing a password before saving it to the database
AnnounceSchema.pre('save', function(next) {
	const date = new Date();
	const titleLower = utils.stringToSlug(this.title);
	this.slug = `${titleLower}-${fromString(min).substr(0, 6)}`;
	this.expirationDate = new Date(date.setMonth(date.getMonth()+1))
	next();
});

AnnounceSchema.statics.findByUser = async function(uid){
	try{
		return await this.model('Announce').find({ user : uid }).exec()
	} catch (err) {
		throw err;
	}
}

// Export mongoose model
module.exports = mongoose.model('Announce', AnnounceSchema);
