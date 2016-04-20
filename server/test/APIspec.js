// Test ordering to make sure this test is run last
//require('./test');

var request;

describe('API tests', function() {
  before(function(done) {
    require('../app')(function(app) {
      request = require('supertest')(app);
      done();
    });
  });

  describe('GET budgets', function() {
    it('should not retrieve budgets without credentials', function(done) {
      request
      .get('/api/budgets/')
      .set('Accept', 'application/json')
      .expect(401, done);
    });
  });
});
