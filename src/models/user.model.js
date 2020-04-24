const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const crypto = require('crypto');
const utils = require('../utils/functions');
const handleError = require('../utils/handleError');
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

	pro: {
		type : Boolean,
		default : false,
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

	salt: String,
	pass_reset: String,

	activated: {
		type : Boolean,
		default : false
	},

	email_validated: {
		type : Boolean,
		default : false
	},

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

const hashPassword = async (password, saltRounds = 10) => {
		return await bcrypt.hash(password, saltRounds)
};

UserSchema.post('init', function(doc) {
	console.log('%s has been initialized from the db', doc._id);
});

// Handler **must** take 3 parameters: the error that occurred, the document
UserSchema.post('save', function(err, doc, next) {
	if(err){
		if (err.name === 'MongoError' && err.code === 11000) {
			throw handleError.DuplicateError('duplicate user');
		} else return next(err);
	}
	next();
});

UserSchema.post('save', function(doc) {
	console.log('%s has been saved', doc._id);
});

UserSchema.post('remove', function(doc) {
	console.log('%s has been removed', doc._id);
});

//hashing a password before saving it to the database
UserSchema.pre('save', async function(next) {
	let user = this;
	try{
		const fullname = utils.stringToSlug(`${user.firstname} ${user.lastname}`);
		user.username = `${fullname}-${uuid().substr(0, 6)}`;
		user.password = await hashPassword(user.password);
		next();
	} catch (err) {
		next(err);
	}
});

UserSchema.statics.findByEmail = async function(email){
	try{
		const user = await this.model('User').findOne({email}).exec();
		if(!user) throw handleError.NotFoundError("user not found");
		else return user;
	} catch (err) {
		throw err;
	}
}

UserSchema.statics.confirmUser = async function(email){
	try{
		const user = await this.model('User').findOne({ email }).exec();
		if (!user)
			throw handleError.NotFoundError();
		if(user.activated && user.email_validated)
			throw handleError.AlreadyActivated('user already activated');

		user.activated = true;
		user.email_validated = true;

		return await user.save();
	}
	catch (err) {
		throw err;
	}
}

UserSchema.statics.resetPassword = async function(email, password){
	try{
		let user = await this.model('User').findByEmail(email);
		const areIdentical = await user.comparePassword(password);
		if(areIdentical) throw handleError.Error("Password are identical");
		user.password = password;
		return await user.save();
	} catch (err) {
		throw err;
	}
};

UserSchema.methods.comparePassword = async function(password){
	const user = this;
	try{
		return await bcrypt.compare(password, user.password);
	} catch (err) {
		throw err;
	}
};

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
