// Test ordering to make sure this test is run last
//require('./test');

var mongoose = require('mongoose');
var expect = require('chai').expect;

var request;

var user = {
  username: 'testuser',
  password: 'testpass',
  email: 'test@test.com'
};

describe('API tests', function() {
  before(function(done) {
    require('../app')(function(app) {
      request = require('supertest')(app);
      done();
    });
  });

  after(function(done) {
    mongoose.connection.db.dropDatabase();
    done();
  });

  describe('POST /auth/register', function() {
    it('should register a user', function(done) {
      request
      .post('/api/auth/register')
      .send(user)
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if(err) throw err;

        expect(res.body.success).to.be.true;
        done();
      });
    });
  });

  describe('POST /auth/login', function() {
    it('should log in with the user', function(done) {
      request
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'testpass' })
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if(err) throw err;

        expect(res.body.success).to.be.true;
        done();
      });
    });

    it('should reject incorrect password', function(done) {
      request
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'wrongpassword' })
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if(err) throw err;

        expect(res.body.success).to.be.false;
        done();
      });
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
