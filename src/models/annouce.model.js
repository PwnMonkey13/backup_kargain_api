const mongoose = require('mongoose');
const AdresseSchema = require('../schemas/addresse.schema');

const AnnounceSchema = new mongoose.Schema({
	user:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},

	phone :{
		type: String,
		trim: true,
	},
	address : AdresseSchema,
	vehicle:{}
}, {
	timestamps: true,
	toJSON: { virtuals: true },
	strict: false
});

// Export mongoose model
module.exports = mongoose.model('Announce', AnnounceSchema);
