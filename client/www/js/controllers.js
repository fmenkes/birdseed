angular.module('client')

.controller('LoginCtrl', function($scope, AuthService, $ionicPopup, $ionicHistory, $state) {
  $scope.user = {
    username: '',
    email: '',
    password: ''
  };

  $scope.login = function() {
    AuthService.login($scope.user).then(function(msg) {
      $ionicHistory.nextViewOptions({
        disableBack: true,
        disableAnimate: true
      });
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

.controller('InsideCtrl', function($scope, AuthService, $ionicHistory, $state) {
  $scope.logout = function() {
    AuthService.logout();
    $ionicHistory.nextViewOptions({
      disableBack: true,
      disableAnimate: true
    });
    $state.go('outside.login');
  };
})

.controller('MainCtrl', function() {

})

.controller('BudgetCtrl', function($scope, $http, DB, API_ENDPOINT) {
  // TODO: lots of room for optimization
  $scope.budgets = [];

  $scope.newBudget = function() {
    var query = 'INSERT INTO budgets (name, income, expenditure) VALUES (?, ?, ?)';
    var args = ['Budget', 10000, 5000];

    DB.query(query, args).then(function() {
      update();
    });
  };

  $scope.deleteBudgets = function() {
    var query = 'DELETE FROM budgets';
    var args = [];

    DB.query(query, args).then(function() {
      update();
    });
  };

  var update = function() {
    DB.getAll('budgets').then(function(budgets) {
      $scope.budgets = budgets;
    });
  };

  update();
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
