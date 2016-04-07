var express  = require('express'),
    mongoose = require('mongoose'),
    database = require('./config/database'),
    app      = express();

require('./models/Test');

database.connect();

var Test = mongoose.model('Test');

Test.create({ hello: 'hello', world: 'world' }, function(err, hello) {
  if(err) console.log("Error creating test doc: " + err);
});

app.get('/', function(req, res) {
  Test.findOne(function(err, doc) {
    if(err) console.log("Error loading test doc: " + err);

    res.send(doc.hello + " " + doc.world + "!");
  });
});

app.listen(8080, function() {
  console.log("Server listening on port 8080.");
});
