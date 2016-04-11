var express  = require('express'),
    mongoose = require('mongoose'),
    database = require('./config/database'),
    app      = express(),
    port     = process.env.PORT || 8080,
    // TODO: dynamic loading of models
    Test     = require('./models/Test');

database.connect(function(code, err) {
  if(err) throw err;

  if(code === 1) console.log('Database connection established.');
});

// Initialize router here to avoid database problems
var router = require('./config/router');

app.use('/', router);

app.listen(port, function() {
  console.log("Server listening on port " + port + ".");
});
