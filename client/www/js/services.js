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
      'income DECIMAL(18,2))');
    });
    db.transaction(function(tx) {
      tx.executeSql('CREATE TABLE IF NOT EXISTS tokens ' +
      '(tokenId INTEGER PRIMARY KEY, ' +
      'user INTEGER, ' +
      'token TEXT, ' +
      'FOREIGN KEY(user) REFERENCES users(userId))');
    });
    db.transaction(function(tx) {
      tx.executeSql('CREATE TABLE IF NOT EXISTS trophies ' +
      '(trophyId INTEGER PRIMARY KEY, ' +
      'name TEXT, ' +
      'user INTEGER, ' +
      'icon TEXT, ' +
      'FOREIGN KEY(user) REFERENCES users(userId))');
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

  return this;
})

.service('WalletService', function($q, DB, Auth) {
  var insertWallet = function(name, budget) {
    // Check which user is logged in
    // TODO: replace this with global angular value
    return Auth.findToken().then(function(result) {
      var query = 'INSERT INTO wallets (name, budget, spent, user) VALUES (?, ?, ?, ?)';
      var args = [name, budget, 0, result.user];

      return DB.query(query, args).then(function(result) {
        return result.insertId;
      });
    });
  };

  var deleteWallet = function(id) {
    var query = 'DELETE FROM wallets WHERE id=?';
    var args = [id];

    return DB.query(query, args);
  };

  var deleteAllWallets = function() {
    var query = 'DELETE FROM wallets';
    var args = [];

    return DB.query(query, args);
  };

  var getAllWallets = function() {
    // Check which user is logged in
    // TODO: replace this with global angular value
    return Auth.findToken().then(function(result) {
      var query = 'SELECT * FROM wallets WHERE user = ?';
      var args = [result.user];

      return DB.query(query, args).then(function(result) {
        var output = [];

        for(var i = 0; i < result.rows.length; i++) {
          output.push(result.rows.item(i));
        }

        return output;
      }, function(err) {
        console.log(err.message);
      });
    });
    //return DB.getAll('wallets');
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
    deleteAll: deleteAllWallets
  };
})

.service('AuthService', function($q, $http, Auth, $ionicPlatform, API_ENDPOINT) {
  var isAuthenticated = false;
  var authToken;

  function storeUserCredentials(userId, token) {
    Auth.insertUser(userId).then(function() {
      Auth.insertToken(token, userId);
    });
    useCredentials(token);
  }

  function useCredentials(token) {
    isAuthenticated = true;
    authToken = token;

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
          console.log(token);
          useCredentials(token);
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
