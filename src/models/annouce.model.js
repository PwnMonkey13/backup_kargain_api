const mongoose = require('mongoose');
const utils = require('../utils/functions');
const AdresseSchema = require('../schemas/addresse.schema');

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

AnnounceSchema.virtual( 'slug' ).get( function () {
	return utils.stringToSlug(this.title);
});

// Export mongoose model
module.exports = mongoose.model('Announce', AnnounceSchema);
