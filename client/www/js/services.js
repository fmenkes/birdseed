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

  // AuthToken function
  this.insertToken = function(token) {
    var query = 'INSERT INTO tokens (token) SELECT ? WHERE NOT EXISTS (SELECT * FROM tokens)';
    var args = [token];

    return this.query(query, args).then(function(result) {
      return result.insertId;
    });
  };

  this.findToken = function() {
    var query = 'SELECT * FROM tokens';
    var args = [];

    return this.query(query, args).then(function(result) {
      return result.rows.item(0);
    });
  };

  this.deleteToken = function() {
    var query = 'DELETE FROM tokens';
    var args = [];

    return this.query(query, args);
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

// TODO: create AuthDB service

.service('AuthService', function($q, $http, DB, $ionicPlatform, API_ENDPOINT) {
  var LOCAL_TOKEN_KEY = 'yourTokenKey';
  var isAuthenticated = false;
  var authToken;

  function storeUserCredentials(token) {
    //window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
    DB.insertToken(token);
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
    //window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    DB.deleteToken();
  }

  var loadUserCredentials = function() {
    //var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    var token = DB.findToken();
    if(token) {
      console.log("User authenticated.");
      useCredentials(token);
    }
  };

  var register = function(user) {
    return $q(function(resolve, reject) {
      $http.post(API_ENDPOINT.url + '/auth/register', user).then(function(result) {
        if(result.data.success) {
          resolve(result.data.msg);
        } else {
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
