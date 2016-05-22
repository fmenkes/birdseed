// using https://devdactic.com/restful-api-user-authentication-2/ as a start

angular.module('client')

.factory('DB', function($q, $cordovaSQLite) {
  var db;

  this.init = function() {
    var deferred = $q.defer();

    if(window.cordova) {
      // App syntax
      db = $cordovaSQLite.openDB({ name: "local.db", location: "default" });
    } else {
      // Ionic serve syntax
      db = window.openDatabase("local.db", "1.0", "Local Database", 10000);
    }

    // Create table queries
    var userQuery = 'CREATE TABLE IF NOT EXISTS users ' +
    '(userId TEXT PRIMARY KEY, ' +
    'username TEXT, ' +
    'savings DECIMAL(18,2) DEFAULT 0, ' +
    'income DECIMAL(18,2) DEFAULT 0, ' +
    'wallets INTEGER DEFAULT 0)';

    var tokenQuery = 'CREATE TABLE IF NOT EXISTS tokens ' +
    '(tokenId INTEGER PRIMARY KEY, ' +
    'user TEXT, ' +
    'token TEXT, ' +
    'FOREIGN KEY(user) REFERENCES users(userId))';

    var trophyQuery = 'CREATE TABLE IF NOT EXISTS trophies ' +
    '(trophyId INTEGER PRIMARY KEY, ' +
    'name TEXT, ' +
    'plainName TEXT, ' +
    'desc TEXT, ' +
    'user TEXT, ' +
    'FOREIGN KEY(user) REFERENCES users(userId))';

    var walletQuery = 'CREATE TABLE IF NOT EXISTS wallets ' +
    '(walletId INTEGER PRIMARY KEY, ' +
    'name TEXT, ' +
    'icon TEXT, ' +
    'user TEXT, ' +
    'budget DECIMAL(18,2), ' +
    'spent DECIMAL(18,2), ' +
    'FOREIGN KEY(user) REFERENCES users(userId))';

    var dateQuery = 'CREATE TABLE IF NOT EXISTS timeStamps ' +
    '(timeStamp TEXT, ' +
    'user TEXT, ' +
    'FOREIGN KEY(user) REFERENCES users(userId))';

    // Really ugly, but maybe best way to do it?
    db.transaction(function(tx) {
      tx.executeSql(userQuery, [], function() {
        tx.executeSql(tokenQuery, [], function() {
          tx.executeSql(trophyQuery, [], function() {
            tx.executeSql(walletQuery, [], function() {
              tx.executeSql(dateQuery, [], function() {
                deferred.resolve("All tables created successfully.");
              }, function(tx, e) {
                deferred.reject(e.message);
              });
            }, function(tx, e) {
              deferred.reject(e.message);
            });
          }, function(tx, e) {
            deferred.reject(e.message);
          });
        }, function(tx, e) {
          deferred.reject(e.message);
        });
      }, function(tx, e) {
        deferred.reject(e.message);
      });
    });

    return deferred.promise;
  };

  // Drop the database.
  this.dropTables = function() {
    db.transaction(function(tx) {
      tx.executeSql('DROP TABLE IF EXISTS budgets');
    });
    db.transaction(function(tx) {
      tx.executeSql('DROP TABLE IF EXISTS users');
    });
    db.transaction(function(tx) {
      tx.executeSql('DROP TABLE IF EXISTS tokens');
    });
    db.transaction(function(tx) {
      tx.executeSql('DROP TABLE IF EXISTS trophies');
    });
    db.transaction(function(tx) {
      tx.executeSql('DROP TABLE IF EXISTS wallets');
    });
    db.transaction(function(tx) {
      tx.executeSql('DROP TABLE IF EXISTS months');
    });
    db.transaction(function(tx) {
      tx.executeSql('DROP TABLE IF EXISTS timeStamps');
    });
  };

  this.query = function(query, args) {
    args = args || [];
    var deferred = $q.defer();

    db.transaction(function(tx) {
      tx.executeSql(query, args, function(tx, result) {
        deferred.resolve(result);
      }, function(tx, err) {
        deferred.reject(err);
      });
    });

    return deferred.promise;
  };

  return this;
})

.factory('Auth', function(DB) {
  this.insertToken = function(token, userId) {
    var query = 'INSERT INTO tokens (token, user) SELECT ?, ? WHERE NOT EXISTS (SELECT * FROM tokens)';
    var args = [token, userId];

    return DB.query(query, args).then(function(result) {
      return result.insertId;
    }, function(err) {
      console.log(err.message);
    });
  };

  this.findToken = function() {
    var query = 'SELECT * FROM tokens';
    var args = [];

    return DB.query(query, args).then(function(result) {
      if(result.rows.length > 0) return result.rows.item(0);

      return null;
    }, function(err) {
      console.log(err.message);
    });
  };

  this.deleteToken = function() {
    var query = 'DELETE FROM tokens';
    var args = [];

    return DB.query(query, args);
  };

  this.insertUser = function(userId) {
    var query = 'INSERT OR IGNORE INTO users (userId) VALUES (?)';
    var args = [userId];

    return DB.query(query, args).then(function(result) {
      //return this.insertTimestamp(userId);
    }, function(err) {
      console.log(err.message);
    });
  };

  this.insertFirstTimestamp = function(userId) {
    //debugger;
    var query = 'INSERT INTO timeStamps (timeStamp, user) ' +
    'SELECT ?, ? ' +
    'WHERE NOT EXISTS(SELECT * FROM timeStamps WHERE user = ?)';
    var args = [new Date(), userId, userId];

    return DB.query(query, args).then(function(result) {

    }, function(err) {
      console.log(err.message);
    });
  };

  this.insertTimestamp = function(userId) {
    console.log("inserting timestamp");
    var query = 'INSERT INTO timeStamps (timeStamp, user) VALUES (?, ?)';
    var args = [new Date(), userId];

    return DB.query(query, args).then(function() {

    }, function(err) {
      console.log(err.message);
    });
  };

  this.getUser = function(userId) {
    var query = 'SELECT * FROM users WHERE userId = ?';
    var args = [userId];

    return DB.query(query, args).then(function(result) {
      return result.rows.item(0);
    }, function(err) {
      console.log(err.message);
    });
  };

  this.updateFinance = function(userId, income, savings) {
    var query = 'UPDATE users SET income = ?, savings = ? WHERE userId = ?';
    var args = [income, savings, userId];

    return DB.query(query, args).then(function(result) {

    }, function(err) {
      console.log(err.message);
    });
  };

  return this;
})

.service('WalletService', function($q, DB, Auth, user) {
  var insertWallet = function(name, budget, icon) {
    var query = 'INSERT INTO wallets (name, budget, icon, spent, user) VALUES (?, ?, ?, ?, ?)';
    var args = [name, budget, icon, 0, user.id];

    // Return the amount of wallets a user has.
    // Maybe actually a very bad way of doing it?
    return DB.query(query, args).then(function(result) {
      return result.insertId;
    });
  };

  var deleteWallet = function(id) {
    var query = 'DELETE FROM wallets WHERE walletId=?';
    var args = [id];

    return DB.query(query, args);
  };

  var addTransaction = function(id, amount) {
    var query = 'UPDATE wallets SET spent = spent + ? WHERE walletId = ?';
    var args = [amount, id];

    return DB.query(query, args).then(function(result) {
      var savings = user.savings - amount > 0 ? user.savings - amount : 0;

      return Auth.updateFinance(user.id, user.income, savings);
    }, function(err) {
      console.log(err.message);
    });
  };

  var emptyWallets = function() {
    var query = 'UPDATE wallets SET spent = 0 WHERE user = ?';
    var args = [user.id];

    return DB.query(query, args).then(function(result) {

    }, function(err) {
      console.log(err.message);
    });
  };

  var deleteAllWallets = function() {
    var query = 'DELETE FROM wallets WHERE user = ?';
    var args = [user.id];

    return DB.query(query, args).then(function(result) {

    }, function(err) {
      console.log(err.message);
    });
  };

  var getAllWallets = function() {
    // Check which user is logged in
    var query = 'SELECT * FROM wallets WHERE user = ?';
    var args = [user.id];

    return DB.query(query, args).then(function(result) {
      var output = [];

      for(var i = 0; i < result.rows.length; i++) {
        output.push(result.rows.item(i));
      }

      return output;
    }, function(err) {
      console.log(err.message);
    });
  };

  var getWallet = function(id) {
    var query = 'SELECT * FROM wallets WHERE walletId = ?';
    var args = [id];

    return DB.query(query, args).then(function(result) {
      console.log(result);
      return result.rows.item(0);
    }, function(err) {
      console.log("Error: " + err.message);
    });
  };

  return {
    insert: insertWallet,
    delete: deleteWallet,
    find: getAllWallets,
    findOne: getWallet,
    emptyWallets: emptyWallets,
    deleteAll: deleteAllWallets,
    addTransaction: addTransaction
  };
})

.service('TrophyService', function(DB, user, TROPHIES, $q) {
  var getAllTrophies = function() {
    var query = 'SELECT * FROM trophies WHERE user = ?';
    var args = [user.id];

    return DB.query(query, args).then(function(result) {
      var output = [];

      for(var i = 0; i < result.rows.length; i++) {
        output.push(result.rows.item(i));
      }

      return output;
    }, function(err) {
      console.log(err.message);
    });
  };

  var giveTrophy = function(trophyName) {
    var deferred = $q.defer();
    var trophy = null;

    TROPHIES.forEach(function(t) {
      if(t.name === trophyName) {
        trophy = t;
        return;
      }
    });

    if(!trophy) {
      var errmsg = "Error: trophy " + trophyName + " not found.";

      deferred.reject(errmsg);
      return deferred.promise;
    }

    var query = 'SELECT * FROM trophies WHERE name = ? AND user = ?';
    var args = [trophyName, user.id];

    DB.query(query, args).then(function(result) {
      if(result.rows.length === 0) {
        var insertQuery = 'INSERT INTO trophies (name, plainName, desc, user) VALUES (?, ?, ?, ?)';
        var insertArgs = [trophy.name, trophy.plainName, trophy.desc, user.id];

        DB.query(insertQuery, insertArgs).then(function() {
          deferred.resolve(trophy.desc);
        }, function(err) {
          deferred.reject(err.message);
        });
      } else {
        deferred.reject("User already has trophy.");
      }
    }, function(err) {
      deferred.reject(err.message);
    });

    return deferred.promise;
  };

  var userHasTrophy = function(trophy) {
    var query = 'SELECT * FROM trophies WHERE name = ? AND user = ?';
    var args = [trophy, user.id];

    return DB.query(query, args).then(function(result) {
      return result.rows.length > 0;
    }, function(err) {
      console.log(err.message);
    });
  };

  // TODO: streamline adding trophies
  var addTrophy = function(name, icon) {
    var query = 'INSERT INTO trophies (name, icon, user) VALUES (?, ?, ?)';
    var args = [name, icon, user.id];

    return DB.query(query, args).then(function(result) {
      return result.insertId;
    }, function(err) {
      console.log(err.message);
    });
  };

  // Debugging purposes.
  var deleteAll = function() {
    var query = 'DELETE FROM trophies WHERE user = ?';
    var args = [user.id];

    return DB.query(query, args);
  };

  return {
    userHasTrophy: userHasTrophy,
    insert: addTrophy,
    giveTrophy: giveTrophy,
    find: getAllTrophies,
    deleteAll: deleteAll
  };
})

.service('MonthlyService', function($q, DB, WalletService, Auth, user) {
  // A messy service, but it makes sure that the user's finance is updated
  // before entering the first view!

  function emptyWallets() {
    WalletService.emptyWallets();
  }

  function addIncome() {
    console.log(user);

    return Auth.getUser(user.id).then(function(u) {
      console.log(u);
      var savings = u.savings + u.income;
      return Auth.updateFinance(user.id, u.income, savings).then(function(result) {
        return;
      });
    });
  }

  function update() {
    emptyWallets();
    return addIncome();
  }

  var checkDate = function() {
    //debugger;
    var query = 'SELECT * FROM timeStamps WHERE user = ? ORDER BY rowid DESC LIMIT 1';
    var args = [user.id];

    return DB.query(query, args).then(function(result) {
      var now = new Date();
      var date = new Date(result.rows.item(0).timeStamp);

      if(now > date && (now.getMonth() > date.getMonth() || now.getFullYear() > date.getFullYear())) {
        return Auth.insertTimestamp(user.id).then(function() {
          return update();
        });
      }
    }, function(err) {
      console.log(err.message);
    });
  };

  return {
    checkDate: checkDate
  };
})

.service('AuthService', function($q, $http, Auth, $ionicPlatform, API_ENDPOINT, MonthlyService, user) {
  var isAuthenticated = false;
  var authToken;

  function storeUserCredentials(userId, token) {
    Auth.insertUser(userId).then(function() {
      Auth.insertToken(token, userId);
    });

    useCredentials(userId, token);
  }

  function useCredentials(userId, token) {
    isAuthenticated = true;
    authToken = token;
    user.id = userId;

    // Set token as default header
    $http.defaults.headers.common.Authorization = authToken;

    return Auth.insertFirstTimestamp(userId).then(function() {
      return MonthlyService.checkDate().then(function() {
        return;
      });
    });
  }

  function destroyUserCredentials() {
    authToken = undefined;
    isAuthenticated = false;
    $http.defaults.headers.common.Authorization = undefined;
    Auth.deleteToken();
  }

  var loadUserCredentials = function() {
    return $q(function(resolve, reject) {
      Auth.findToken().then(function(token) {
        if(token) {
          useCredentials(token.user, token.token).then(function() {
            resolve("User Authenticated");
          });
        } else {
          reject();
        }
      });
    });
  };

  // TODO: check if user is online

  var register = function(user) {
    return $q(function(resolve, reject) {
      $http.post(API_ENDPOINT.url + '/auth/register', user).then(function(result) {
        if(result.data.success) {
          resolve(result.data.msg);
        } else {
          console.log(result.data);
          reject(result.data.msg);
        }
      });
    });
  };

  // TODO: loading popup

  var login = function(user) {
    return $q(function(resolve, reject) {
      $http.post(API_ENDPOINT.url + '/auth/login', user).then(function(result) {
        if(result.data.success) {
          storeUserCredentials(result.data.userId, result.data.token);
          resolve(result.data.msg);
        } else {
          reject(result.data.msg);
        }
      });
    });
  };

  var logout = function() {
    destroyUserCredentials();
  };

  return {
    login: login,
    register: register,
    logout: logout,
    loadUserCredentials: loadUserCredentials,
    isAuthenticated: function() { return isAuthenticated; },
    getUser: function() { return user; }
  };
})

.factory('AuthInterceptor', function($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function(response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
      }[response.status], response);
      return $q.reject(response);
    }
  };
})

.config(function($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
});
