const mongoose = require('mongoose');
const utils = require('../utils/functions');
const AdresseSchema = require('../schemas/addresse.schema');
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

	slug : {
		type: String,
		trim: true,
	},

	phone :{
		type: String,
		trim: true,
	},

	address : AdresseSchema,
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
