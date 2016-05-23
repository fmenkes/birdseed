var express = require('express'),
    jwt     = require('jwt-simple'),
    User    = require('../../../models/User'),
    router  = express.Router(),
    secret;

if(!process.env.HEROKU_SECRET) {
  secret = require('../../../config/keys').secret;
} else {
  secret = process.env.HEROKU_SECRET;
}

router.get('/', function(req, res) {
  res.send("This is the login route.");
});

router.post('/', function(req, res) {
  // Log in with either username or e-mail. TODO: make accounts e-mail only?

  User.findOne({
    $or: [ { username: req.body.username }, { email: req.body.username } ]
  }, function(err, user) {
    if(err) throw err;

    if(!user) {
      res.json({ success: false, msg: 'Authentication failed. User not found.' });
    } else {
      user.comparePassword(req.body.password, function(err, match) {
        if(match && !err) {
          var token = jwt.encode(user, secret);

          res.json({ success: true, token: 'JWT ' + token, userId: user._id });
        } else {
          res.json({ success: false, msg: 'Authentication failed. Incorrect password.' });
        }
      });
    }
  });
});

module.exports = router;
