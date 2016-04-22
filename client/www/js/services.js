// using https://devdactic.com/restful-api-user-authentication-2/ as a start

angular.module('client')

.service('AuthService', function($q, $http, $cordovaSQLite, $ionicPlatform, API_ENDPOINT) {
  var LOCAL_TOKEN_KEY = 'yourTokenKey';
  var isAuthenticated = false;
  var authToken;
  var db;


  function loadUserCredentials() {
    // TODO: Store token in localStorage for now. Migrate to SQLite later
    // TODO: refine sql query
    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    db.executeSql('SELECT * FROM tokens', [], function(resultSet) {
      token = resultSet.rows.item(0).token;
    }, function(err) {
      console.log('Error: ' + err.message);
    });
    if(token) {
      console.log("User authenticated.");
      useCredentials(token);
    }
  }

  function storeUserCredentials(token) {
    // TODO: localStorage now, SQLite later
    window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
    db.executeSql('INSERT INTO tokens (token) SELECT \'' + token + '\' WHERE NOT EXISTS (SELECT * FROM tokens)');
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
    // TODO: localStorage now, SQLite later
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    db.executeSql('DELETE FROM tokens');
  }

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

  // TODO: dbService
  $ionicPlatform.ready(function() {
    db = $cordovaSQLite.openDB({ name: "local.db", location: 'default' });
    loadUserCredentials();
  });

  return {
    login: login,
    register: register,
    logout: logout,
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
