var express = require('express'),
    router  = express.Router();

router.get('/', function(req, res) {
  res.send("This is the signin route.");
});

module.exports = router;
