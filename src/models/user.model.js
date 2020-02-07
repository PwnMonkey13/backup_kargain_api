const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const crypto = require('crypto');
const AdresseSchema = require('../schemas/addresse.schema');

const UserSchema = new mongoose.Schema({
	name:{
		firstname : {
			type: String,
			required: true
		},
		lastname : {
			type: String,
			required: true,
			trim: true,
		},
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
	picture:{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'media'
	},
	about: {
		type: String,
		trim: true,
	},
	phone: {
		type: String,
		trim: true,
	},
	address : AdresseSchema,
	password: {
		type: String,
		trim: true,
		required: true
	},
	clear_password: {
		type: String,
		trim: true,
		required: true
	},
	role: {
		type: String,
		enum: ['Client', 'Admin'],
		default: 'Client'
	},
	socials:{
		twitter: String,
		facebook: String
	}
}, {
	toJSON: { virtuals: true },
	strict: false
});

//hashing a password before saving it to the database
UserSchema.pre('save', function(next) {
	let user = this;
	this.constructor.find({ identifierName: user.identifierName }, function(err, result){
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
	return `${this.name.firstname} ${this.name.lastname}`;
});

UserSchema.virtual( 'fullAddress' ).get( function () {
	const strings = Object.keys(this.address.toObject()).filter(key => this.address[key] !== "").map(key => this.address[key]);
	return strings.join(", ");
});

UserSchema.virtual('userId').get(function () {
		return this.id;
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
