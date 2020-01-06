const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
	name : {
		type: String,
		required: true
	},
	email: {
		type: String,
		trim: true,
		unique: true,
		required: true
	},
	phone: {
		type: String
	},
	password: {
		type: String,
		trim: true,
		required: true
	},
	role: {
		type: String,
		enum: ['Client', 'Admin'],
		default: 'Client'
	},
}, {
	strict: false
});

//hashing a password before saving it to the database
UserSchema.pre('save', function(next) {
	let user = this;
	console.log(user);

	bcrypt.hash(user.password, 10, function(err, hash) {
		console.log("hash : " + hash);
		user.clear_password = user.password;
		user.password = hash;
		console.log(user);
		next();
	});
});

//authenticate input against database
// UserSchema.statics.authenticate = function(email, password, cb) {
// 	User.findOne({ email: email }).exec(function(err, user) {
// 		if (err) {
// 			return cb(err);
// 		} else if (!user) {
// 			let err = new Error('User not found.');
// 			err.status = 401;
// 			return cb(err);
// 		}
// 		bcrypt.compare(password, user.password, function(err, isMatch) {
// 			if (err) {
// 				return cb(err);
// 			}
// 			cb(null, isMatch);
// 		});
// 	});
// };

// UserSchema.virtual('ID').get(function() {
// 	return this._id.toHexString();
// });

// Export mongoose model
module.exports = mongoose.model('User', UserSchema);
