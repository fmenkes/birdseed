var express = require('express'),
    User    = require('../../models/User'),
    passport = require('passport'),
    jwt = require('jwt-simple'),
    secret,
    router  = express.Router();

if(!process.env.HEROKU_SECRET) {
  secret = require('../../config/keys').secret;
} else {
  secret = process.env.HEROKU_SECRET;
}

router.get('/', passport.authenticate('jwt', { session: false }), function(req, res) {
  var token = getToken(req.headers);

  if(token) {
    var decoded = jwt.decode(token, secret);
    User.findOne({
      username: decoded.username
    }, function(err, user) {
      if(err)
        throw err;

      if(!user) {
        res.status(403).json({ success: false, msg: 'Authentication failed. User does not exist.'});
      } else {
        res.json({ success: true, msg: 'Authentication succeeded.', budgets: user.budgets});
      }
    });
  } else {
    res.status(403).json({ success: false, msg: 'Authentication failed. Token not provided.' });
  }
});

router.post('/', passport.authenticate('jwt', { session: false }), function(req, res) {
  var token = getToken(req.headers);

  if(token) {
    var decoded = jwt.decode(token, secret);

    User.findOne({
      username: decoded.username
    }, function(err, user) {
      if(err)
        throw(err);

      if(!user) {
        res.status(403).json({ success: false, msg: 'Authentication failed. User does not exist.'});
      } else {
        var newBudget = { name: "Budget", income: 10000, expenditure: 5000 };
        user.budgets.push(newBudget);

        user.save(function(err) {
          if(err) return res.json({ success: false, msg: err });

          res.json({ success: true, msg: 'New budget saved.' });
        });
      }
    });
  } else {
    res.status(403).json({ success: false, msg: 'Authentication failed. Token not provided.' });
  }
});

getToken = function(headers) {
  if(headers && headers.authorization) {
    var split = headers.authorization.split(' ');
    if(split.length === 2) {
      return split[1];
    } else {
      return null;
    }
  }

  return null;
};

module.exports = router;
