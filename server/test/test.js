var expect = require("chai").expect;
var database = require("../config/database");
var mongoose = require("mongoose");

var connection = null;

describe("Database tests...", function() {
  it("should connect to the database", function(done) {
    // Increase timeout since this test can take a little longer.
    this.timeout(3000);

    database.connectToLocalDatabase(function(code, err) {
      if(err) throw err;

      expect(code).to.equal(1);
      connection = mongoose.connection;
      done();
    });
  });

  it("should not be able to save a user with malformed email", function(done) {
    // TODO: clean up this test
    require("../models/User");

    var User = mongoose.model('User');

    User.create({ username: "testuser", password: "testpass", email: "bademail" }, function(err, user) {
      expect(err).to.not.be.null;
      done();
    });
  });
});
