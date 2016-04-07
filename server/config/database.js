var keys = require('./keys'),
    mongoose = require('mongoose');

// Having special characters in the mongodb password will crash the server. Any way to fix this?

var url = 'mongodb://fmenkes:' + keys.MONGO_PASSWORD + '@ds015710.mlab.com:15710/1dv430';

console.log(url);

module.exports.connect = function() {
  mongoose.connect(url);
};
