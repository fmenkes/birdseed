var mongoose = require('mongoose'),
    bcrypt   = require('bcrypt');
require('mongoose-type-email');


// User schema.
// Encryption thanks to https://matoski.com/article/jwt-express-node-mongoose/

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
    required: true,
    unique: true
  },
  budgets: [
    {
      name: String,
      income: Number,
      expenditure: Number
    }
  ]
});

User.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

User.methods.comparePassword = function (pw, callback) {
    bcrypt.compare(pw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        callback(null, isMatch);
    });
};

module.exports = mongoose.model('User', User);
