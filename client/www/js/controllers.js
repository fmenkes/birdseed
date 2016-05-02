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

.controller('InsideCtrl', function($scope, AuthService, $ionicHistory, $ionicSideMenuDelegate, $state) {
  $scope.logout = function() {
    AuthService.logout();
    $ionicHistory.nextViewOptions({
      disableBack: true,
      disableAnimate: true
    });
    $state.go('outside.login');
  };

  $scope.toggleRight = function() {
    $ionicSideMenuDelegate.toggleRight();
  };
})

.controller('MainCtrl', function($scope) {

})

.controller('WalletsCtrl', function($scope, $ionicPopup, WalletService, API_ENDPOINT) {
  // TODO: lots of room for optimization
  $scope.wallets = [];

  $scope.newWallet = function() {
    $scope.wallet = {};

    var namePopup = $ionicPopup.show({
      title: 'New Wallet',
      template: '<input id="walletName" type="text" ng-model="wallet.name">',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        { text: 'Save',
          onTap: function(e) {
            if(!$scope.wallet.name) {
              e.preventDefault();
            } else {
              return $scope.wallet.name;
            }
          }
        }
      ]
    });

    namePopup.then(function(name) {
      if(!name) return;

      WalletService.insert(name).then(function() {
        update();
      });
    });
  };

  $scope.deleteWallets = function() {
    WalletService.deleteAll().then(function() {
      update();
    });
  };

  var update = function() {
    WalletService.find().then(function(wallets) {
      $scope.wallets = wallets;
    });
  };

  update();
})

.controller('NewWalletCtrl', function($scope, $state, $ionicHistory, WalletService) {
  $scope.wallet = {
    name: ''
  };

  $scope.saveWallet = function() {
    var name = $scope.wallet.name;
    var budget = $scope.wallet.budget;

    if(!name || !budget) return;

    WalletService.insert(name, budget).then(function() {
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go('inside.wallets');
    });
  };
})

.controller('WalletDetailCtrl', function($scope, $stateParams, WalletService) {
  $scope.wallet = {
    name: 'default',
    budget: 0,
    spent: 0
  };

  WalletService.findOne($stateParams.walletId).then(function(result) {
    $scope.wallet = result;
  });
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
