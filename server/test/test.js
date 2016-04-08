var expect = require("chai").expect;
var database = require("../config/database");

describe("Database tests...", function() {
  it("should connect to the database", function(done) {
    // Increase timeout since this test can take a little longer.
    this.timeout(3000);

    database.connect(function(code, err) {
      if(err) throw err;

      expect(code).to.equal(1);
      done();
    });
  });
});
