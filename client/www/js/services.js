// using https://devdactic.com/restful-api-user-authentication-2/ as a start

angular.module('client')

// TODO: rewrite this as a wrapper with all db functions
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
      tx.executeSql('CREATE TABLE IF NOT EXISTS tokens (token TEXT)');
      tx.executeSql('CREATE TABLE IF NOT EXISTS budgets (name TEXT, income INTEGER, expenditure INTEGER)');
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
  this.insertToken = function(token) {
    var query = 'INSERT INTO tokens (token) SELECT ? WHERE NOT EXISTS (SELECT * FROM tokens)';
    var args = [token];

    return DB.query(query, args).then(function(result) {
      return result.insertId;
    });
  };

  this.findToken = function() {
    var query = 'SELECT * FROM tokens';
    var args = [];

    return DB.query(query, args).then(function(result) {
      if(result.rows.length > 0) return result.rows.item(0);

      return null;
    });
  };

  this.deleteToken = function() {
    var query = 'DELETE FROM tokens';
    var args = [];

    return DB.query(query, args);
  };

  return this;
})

.service('BudgetingService', function($q, DB) {
  var insertBudget = function(name) {
    var query = 'INSERT INTO budgets (name, income, expenditure) VALUES (?, ?, ?)';
    var args = [name, 10000, 5000];

    return DB.query(query, args).then(function(result) {
      return result.insertId;
    });
  };

  var deleteBudget = function(id) {
    var query = 'DELETE FROM budgets WHERE id=?';
    var args = [id];

    return DB.query(query, args);
  };

  var deleteAllBudgets = function() {
    var query = 'DELETE FROM budgets';
    var args = [];

    return DB.query(query, args);
  };

  var getAllBudgets = function() {
    return DB.getAll('budgets');
  };

  return {
    insert: insertBudget,
    delete: deleteBudget,
    getAll: getAllBudgets,
    deleteAll: deleteAllBudgets
  };
})

.service('AuthService', function($q, $http, Auth, $ionicPlatform, API_ENDPOINT) {
  var isAuthenticated = false;
  var authToken;

  function storeUserCredentials(token) {
    Auth.insertToken(token);
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
          useCredentials(token);
          resolve("User Authenticated");
        } else {
          reject();
        }
      });
    });
  };

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
          storeUserCredentials(result.data.token);
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
    isAuthenticated: function() { return isAuthenticated; }
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
