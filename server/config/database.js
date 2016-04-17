var keys = require('./keys'),
    mongoose = require('mongoose');

// Having special characters in the mongodb password will crash the server.
// Probably fixed by passing options?

// mLab recommended connection options: https://gist.github.com/mongolab-org/9959376


var options = {
  server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
  replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } },
  user: 'fmenkes',
  pass: keys.MONGO_PASSWORD
};

var mongodbUri = 'mongodb://ds015710.mlab.com:15710/1dv430';

// Connect to local database for testing purposes.
module.exports.connectToLocalDatabase = function(callback) {
  mongoose.connect('mongodb://localhost:27017/budgetbuddy');

  var conn = mongoose.connection;

  conn.on('error',function (err) {
    // -1: ERROR
    callback(-1, err);
  });

  conn.once('open', function() {
    // 1: OK
    callback(1);
  });
};

// TODO: JSDOC
module.exports.connect = function(callback) {
  mongoose.connect(mongodbUri, options);

  var conn = mongoose.connection;

  conn.on('error',function (err) {
    // -1: ERROR
    callback(-1, err);
  });

  conn.once('open', function() {
    // 1: OK
    callback(1);
  });

  // Default callback?
};
