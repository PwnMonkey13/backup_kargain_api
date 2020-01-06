const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const config = require('../config/config');
const User = require('../models').User;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwt.encryption
};

// Setting up JWT login strategy
const jwtLogin = new JwtStrategy(opts, (jwt_payload, done) => {
  if (jwt_payload.user._id) {
    User.findOne({ _id: jwt_payload.user._id }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    });
  } else return done(null, false);
});

passport.use(jwtLogin);

module.exports = passport;
