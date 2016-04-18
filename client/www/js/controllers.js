angular.module('client')

.controller('LoginCtrl', function($scope, AuthService, $ionicPopup, $state) {
  $scope.user = {
    username: '',
    email: '',
    password: ''
  };

  $scope.login = function() {
    AuthService.login($scope.user).then(function(msg) {
      $state.go('inside.main');
    }, function(errMsg) {
      var alertPopup = $ionicPopup.alert({
        title: 'Login failed',
        template: errMsg
      });
    });
  };

  $scope.test = function() {
    $scope.testText = "test";
  };
})

.controller('RegisterCtrl', function($scope, AuthService, $ionicPopup, $state) {
  $scope.user = {
    username: '',
    email: '',
    password: ''
  };

  $scope.register = function() {
    AuthService.register($scope.user).then(function(msg) {
      $state.go('outside.login');
      var alertPopup = $ionicPopup.alert({
        title: 'Registration successful',
        template: msg
      });
    }, function(errMsg) {
      if(errMsg.code === 11000)
        // TODO: Change this to something more informative
        errMsg = 'Username or email already in use.';

      var alertPopup = $ionicPopup.alert({
        title: 'Registration failed',
        template: errMsg
      });
    });
  };
})

.controller('MainCtrl', function() {

})

.controller('BudgetCtrl', function($scope, $http, API_ENDPOINT) {
  $scope.budgets = [];

  //TODO: automatic update of budgets in list
  var update = function() {
    $http.get(API_ENDPOINT.url + '/budgets').then(function(result) {
      $scope.budgets = result.data.budgets;
    }, function(errMsg) {
      console.log(errMsg);
    });
  };

  update();

  $scope.newBudget = function() {
    $http.post(API_ENDPOINT.url + '/budgets').then(function(result) {
      update();
    }, function(errMsg) {
      console.log(errMsg);
    });
  };
})

.controller('AppCtrl', function($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS) {
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $state.go('outside.login');
    var alertPopup = $ionicPopup.alert({
      title: 'Session Lost!',
      template: 'Sorry, You have to login again.'
    });
  });
});
