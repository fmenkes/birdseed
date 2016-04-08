var mongoose = require('mongoose');
require('mongoose-type-email');


// User schema.
// TODO: password encryption

var Schema = mongoose.Schema;

var User = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: mongoose.SchemaTypes.Email,
    required: true
  }
});

mongoose.model('User', User);
