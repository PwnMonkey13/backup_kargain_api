const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const crypto = require('crypto');
const utils = require('../utils/functions');
const AdresseSchema = require('../schemas/addresse.schema');
const { uuid, fromString } = require('uuidv4');

const UserSchema = new mongoose.Schema({
	firstname: {
		type: String,
		required: true,
		trim: true,
	},

	lastname: {
		type: String,
		required: true,
		trim: true,
	},

	username : {
		type: String,
		trim: true,
	},

	email: {
		type: String,
		trim: true,
		unique: true,
		required: true
	},

	role: {
		type: String,
		enum: ['Client', 'Admin'],
		default: 'Client'
	},

	phone: {
		type: String,
		trim: true,
	},

	picture:{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'media'
	},

	about: {
		type: String,
		trim: true,
	},

	socials:{
		twitter: String,
		facebook: String
	},

	address : {
		type: String,
		trim: true,
	},

	postalcode : {
		type: String,
		trim: true,
	},

	city : {
		type: String,
		trim: true,
	},

	country : {
		type: String,
		trim: true,
	},

	password: {
		type: String,
		trim: true,
		required: true
	},

	clear_password: {
		type: String,
		trim: true,
	},

	activated: Boolean,

	email_validated: Boolean,

}, {
	strict: false,
	toObject: {
		virtuals: true,
		transform: function (doc, ret) {
			delete ret._id;
			delete ret.password;
			delete ret.clear_password;
		}
	},
	toJSON: {
		virtuals: true,
		transform: function (doc, ret) {
			delete ret._id;
			delete ret.password;
			delete ret.clear_password;
		}
	}
});

//hashing a password before saving it to the database
UserSchema.pre('save', function(next) {
	let user = this;
	const fullname = utils.stringToSlug(`${user.firstname} ${user.lastname}`);
	user.username = `${fullname}-${uuid().substr(0, 6)}`;
	user.clear_password = user.password;

	this.constructor.find({ username: user.username }, function(err, result){
		if (err) return next(err);
		if(result.length !== 0) return next('username already in use');

		bcrypt.hash(user.password, 10, function(err, hash) {
			if(err) return next(err);
			user.clear_password = user.password;
			user.password = hash;
			next();
		});
	});
});

UserSchema.virtual( 'fullname' ).get( function () {
	const user = this;
	return `${user.firstname} ${user.lastname}`;
});

UserSchema.virtual( 'fullAddress' ).get( function () {
	const user = this;
	if(!user.address) return null;
	const address = user.address.toObject();
	return Object.keys(address).reduce((carry, key) => [...carry, address[key]], []).join(", ");
});

UserSchema.virtual('twitter_url').get(function() {
		if (this.socials.twitter) {
			return 'http://twitter.com/' + encodeURIComponent(this.socials.twitter);
		}
});

UserSchema.virtual('facebook_url').get(function() {
	if (this.socials.facebook) {
		return 'http://facebook.com/' + encodeURIComponent(this.socials.facebook);
	}
});

UserSchema.virtual("avatar").get(function() {
	// Load picture from profile
	if (this.picture) return this.picture;

	// Generate a gravatar picture
	if (!this.email) return "https://gravatar.com/avatar/?s=64&d=wavatar";

	let md5 = crypto.createHash("md5").update(this.email).digest("hex");
	return "https://gravatar.com/avatar/" + md5 + "?s=64&d=wavatar";
});

// Export mongoose model
module.exports = mongoose.model('User', UserSchema);
