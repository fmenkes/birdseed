var mongoose = require('mongoose');
var mongo_password;

// Having special characters in the mongodb password will crash the server.
// Probably fixed by passing options?

// mLab recommended connection options: https://gist.github.com/mongolab-org/9959376

if(!process.env.HEROKU_MONGO_PASSWORD) {
  mongo_password = require('./keys').MONGO_PASSWORD;
} else {
  mongo_password = process.env.HEROKU_MONGO_PASSWORD;
}

var url = '',
    options = {};

if(process.env.NODE_ENV === 'testing') {
  url = 'mongodb://localhost:27017/budgetbuddy';
} else {
  url = 'mongodb://ds015710.mlab.com:15710/1dv430';
  options = {
    server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } },
    user: 'fmenkes',
    pass: mongo_password
  };
}

// TODO: JSDOC
module.exports.connect = function(callback) {
  mongoose.connect(url, options);

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
