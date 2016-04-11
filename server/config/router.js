var express = require('express'),
    mongoose = require('mongoose'),
    router  = express.Router(),
    glob    = require('glob'),
    path    = require('path'),
    Test    = mongoose.model('Test');

router.get('/', function(req, res) {
  Test.findOne(function(err, doc) {
    if(err) console.log("Error loading test doc: " + err);
    res.send(doc.hello + " " + doc.world + "!");
  });
});

// The following function dynamically retrieves all the routes
// in the /routes directory, logs them to the console,
// and connects them to the router.
console.log("Setting up routes...");
glob.sync('./routes/**/*.js').forEach(function(file) {
  var route = require(path.resolve(file));
  var routeName = /(?:\/routes)(\/.+)(?:\.js)/.exec(file)[1];
  console.log(routeName);
  router.use(routeName, route);
});

module.exports = router;
