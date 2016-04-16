var express = require('express'),
    User    = require('../../../models/User'),
    router  = express.Router();

router.get('/', function(req, res) {
  res.send("This is the signup route.");
});

router.post('/', function(req, res) {
  // Route for creating a new user.

  if(!req.body.username || !req.body.password) {
    res.json({ success: false, msg: 'Username or password not provided.' });
  } else {
    // Create a new user.
    var newUser = new User(
      { username: req.body.username,
        password: req.body.password,
        email:    req.body.email });

    // Save the user in the database.
    newUser.save(function(err) {
      if(err) return res.json({ success: false, msg: err });

      res.json({ success: true, msg: 'New user registered successfully.' });
    });
  }
});

module.exports = router;
