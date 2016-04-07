var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Test = new Schema({
  hello: String,
  world: String
});

mongoose.model('Test', Test);
