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

var router = require('./config/router');
require('./config/passport')(passport);

app.use('/', router);

function connect(callback) {
  database.connect(function(code, err) {
    // TODO: don't crash the server if connection is lost!
    if(err) throw err;

    if(code === 1) console.log('Database connection established.');

    app.listen(port, function() {
      console.log("Server listening on port " + port + ".");
      if(callback) callback(app);
    });
  });
}

if(process.env.NODE_ENV !== 'testing')
  connect();
else {
  module.exports = function(callback) {
    connect(callback);
  };
}
