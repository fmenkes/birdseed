// using https://devdactic.com/restful-api-user-authentication-2/ as a start

angular.module('client')

.factory('DB', function($q, $cordovaSQLite, $ionicPlatform) {
  var db;

  this.init = function() {
    if(window.cordova) {
      // App syntax
      db = $cordovaSQLite.openDB({ name: "local.db", location: "default" });
    } else {
      // Ionic serve syntax
      db = window.openDatabase("local.db", "1.0", "Local Database", 10000);
    }
    db.transaction(function(tx) {
      tx.executeSql('CREATE TABLE IF NOT EXISTS users ' +
      '(userId TEXT PRIMARY KEY, ' +
      'username TEXT, ' +
      'active INTEGER, ' +
      'savings DECIMAL(18,2), ' +
      'income DECIMAL(18,2))', [], function() {
        console.log("Created users table.");
      }, function(tx, e) {
        console.log(e);
      });
    });
    db.transaction(function(tx) {
      tx.executeSql('CREATE TABLE IF NOT EXISTS tokens ' +
      '(tokenId INTEGER PRIMARY KEY, ' +
      'user INTEGER, ' +
      'token TEXT, ' +
      'FOREIGN KEY(user) REFERENCES users(userId))', [], function() {
        console.log("Created tokens table.");
      }, function(tx, e) {
        console.log(e);
      });
    });
    db.transaction(function(tx) {
      tx.executeSql('CREATE TABLE IF NOT EXISTS trophies ' +
      '(trophyId INTEGER PRIMARY KEY, ' +
      'name TEXT, ' +
      'user INTEGER, ' +
      'icon TEXT, ' +
      'FOREIGN KEY(user) REFERENCES users(userId))', [], function() {
        console.log("Created trophies table.");
      }, function(tx, e) {
        console.log(e);
      });
    });
    db.transaction(function(tx) {
      tx.executeSql('CREATE TABLE IF NOT EXISTS wallets ' +
      '(walletId INTEGER PRIMARY KEY, ' +
      'name TEXT, ' +
      'icon TEXT, ' +
      'user INTEGER, ' +
      'budget DECIMAL(18,2), ' +
      'spent DECIMAL(18,2), ' +
      'FOREIGN KEY(user) REFERENCES users(userId))', [], function() {
        console.log("Created wallets table.");
      }, function(tx, e) {
        console.log(e);
      });
    });

    //this.dropTables();
  };

  // Drop the database.
  this.dropTables = function() {
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
  };

  this.getAll = function(table) {
    var query = 'SELECT * FROM ' + table;
    var args = [];
    var deferred = $q.defer();

    db.transaction(function(tx) {
      tx.executeSql(query, args, function(tx, result) {
        var output = [];

        for(var i = 0; i < result.rows.length; i++) {
          output.push(result.rows.item(i));
        }

        console.log(result, output);

        deferred.resolve(output);
      }, function(err) {
        deferred.reject(console.log(err.message));
      });
    });

    return deferred.promise;
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
      console.log(result);

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
    var query = 'INSERT INTO users (userId) VALUES (?)';
    var args = [userId];

    return DB.query(query, args).then(function(result) {
      console.log(result);
      return result.insertId;
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

  this.updateIncome = function(userId, income) {
    var query = 'UPDATE users SET income = ? WHERE userId = ?';
    var args = [income, userId];

    console.log(userId);

    return DB.query(query, args).then(function(result) {
      console.log(result);
    }, function(err) {
      console.log(err.message);
    });
  };

  return this;
})

.service('WalletService', function($q, DB, Auth, user) {
  var insertWallet = function(name, budget) {
    var query = 'INSERT INTO wallets (name, budget, spent, user) VALUES (?, ?, ?, ?)';
    var args = [name, budget, 0, user.id];

    return DB.query(query, args).then(function(result) {
      return result.insertId;
    });
  };

  var deleteWallet = function(id) {
    var query = 'DELETE FROM wallets WHERE id=?';
    var args = [id];

    return DB.query(query, args);
  };

  var addTransaction = function(id, amount) {
    var query = 'UPDATE wallets SET spent = spent + ? WHERE walletId = ?';
    var args = [amount, id];

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
    deleteAll: deleteAllWallets,
    addTransaction: addTransaction
  };
})

.service('TrophyService', function(DB, user) {
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
    find: getAllTrophies,
    deleteAll: deleteAll
  };
})

.service('AuthService', function($q, $http, Auth, $ionicPlatform, API_ENDPOINT, user) {
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
          useCredentials(token.user, token.token);
          resolve("User Authenticated");
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
