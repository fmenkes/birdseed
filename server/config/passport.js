var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var User = require('../models/User');
var secret = require('./keys').secret;

// passport config from https://devdactic.com/restful-api-user-authentication-1/

module.exports = function(passport) {
  var options = {
    secretOrKey: secret,
    jwtFromRequest: ExtractJwt.fromBodyField('x-www-form-urlencoded')
  };

  passport.use(new JwtStrategy(options, function(jwt_payload, done) {
    User.findOne({id: jwt_payload.id}, function(err, user) {
      if(err) return done(err, false);

      if(user) done(null, user);

      else done(null, false);
    });
  }));
};
