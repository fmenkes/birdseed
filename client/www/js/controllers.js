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

.controller('InsideCtrl', function($scope, AuthService, $ionicHistory, $ionicSideMenuDelegate, $state, Auth, user) {
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

  $scope.user = user;

  var update = function() {
    Auth.getUser(user.id).then(function(result) {
      $scope.user.income = result.income;
    });
  };

  update();
})

.controller('MainCtrl', function($scope) {

})

.controller('IncomeCtrl', function($scope, Auth, $ionicHistory, $state) {
  $scope.updateIncome = function() {
    if(!$scope.user.income) return;

    Auth.updateIncome($scope.user.id, $scope.user.income).then(function() {
      $ionicHistory.nextViewOptions({
        disableBack: true,
        disableAnimate: true
      });
      $state.go('inside.main');
    });
  };
})

.controller('WalletsCtrl', function($scope, WalletService, API_ENDPOINT) {
  $scope.wallets = [];

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

.controller('NewWalletCtrl', function($scope, $state, $ionicHistory, $ionicPopup, WalletService, TrophyService) {
  $scope.wallet = {
    name: ''
  };

  $scope.saveWallet = function() {
    var name = $scope.wallet.name;
    var budget = $scope.wallet.budget;

    if(!name || !budget) return;

    WalletService.insert(name, budget).then(function() {
      TrophyService.userHasTrophy("firstWallet").then(function(hasTrophy) {
        if(!hasTrophy) {
          $ionicPopup.alert({
            title: "New trophy!",
            template: "<p>You created your first wallet!</p>"
          }).then(function() {
            TrophyService.insert("firstWallet", "trophy");
          });
        }

        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $state.go('inside.wallets');
      });
    });
  };
})

.controller('WalletDetailCtrl', function($scope, $stateParams, WalletService) {
  $scope.wallet = {
    name: 'default',
    budget: 0,
    spent: 0,
    walletId: 0,
    transaction: 0
  };

  var update = function() {
    WalletService.findOne($stateParams.walletId).then(function(result) {
      $scope.wallet = result;
    });
  };

  $scope.newTransaction = function() {
    console.log($scope.wallet.transaction);
    if(!$scope.wallet.transaction) return;

    WalletService.addTransaction($scope.wallet.walletId, $scope.wallet.transaction).then(function() {
      update();
    });
  };

  update();
})

.controller('TrophiesCtrl', function($scope, TrophyService, $ionicPopup) {
  $scope.trophies = [];

  var update = function() {
    TrophyService.find().then(function(trophies) {
      $scope.trophies = trophies;
    });
  };

  //TODO: add wallet.description
  $scope.showPopup = function(trophy) {
    $scope.trophy = trophy;
    var title = trophy.name;

    $ionicPopup.show({
      scope: $scope,
      title: title,
      template: "<img class='trophy' ng-src='img/{{ trophy.icon }}.png'><br><p>You've created your first wallet!</p>",
      buttons: [{ text: 'OK', type: 'button-calm', onTap: function(e) { return; } }]
    });
  };

  $scope.deleteTrophies = function() {
    TrophyService.deleteAll().then(function() {
      update();
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
