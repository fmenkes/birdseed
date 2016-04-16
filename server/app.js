var express  = require('express'),
    mongoose = require('mongoose'),
    database = require('./config/database'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    app      = express(),
    port     = process.env.PORT || 8080,
    // TODO: dynamic loading of models
    Test     = require('./models/Test');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());

database.connect(function(code, err) {
  if(err) throw err;

  if(code === 1) console.log('Database connection established.');
});

// Initialize router and passport here to avoid database problems
var router = require('./config/router');
require('./config/passport')(passport);

app.use('/', router);

app.listen(port, function() {
  console.log("Server listening on port " + port + ".");
});
