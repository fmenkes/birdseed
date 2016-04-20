var expect = require("chai").expect;
var database = require("../config/database");
var mongoose = require("mongoose");
var User = require('../models/User');

describe("Database tests...", function() {
  after(function(done) {
    // Drop the local test database after testing.
    mongoose.connection.db.dropDatabase();
    mongoose.disconnect();
    done();
  });

  it("should connect to the database", function(done) {
    database.connect(function(code, err) {
      if(err) throw err;

      expect(code).to.equal(1);
      done();
    });
  });

  it("should be able to save a user", function(done) {
    User.create({ username: "testuser", password: "testpass", email: "goodemail@fakemailaddress.com" }, function(err, user) {
      if(err) throw err;

      expect(user).to.not.be.null;
      done();
    });
  });

  it("should not be able to save a user with malformed email", function(done) {
    User.create({ username: "fakeuser", password: "fakepass", email: "bademail" }, function(err, user) {
      expect(err.message).to.equal('User validation failed');
      done();
    });
  });
});
