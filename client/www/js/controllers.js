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
      $scope.user.savings = result.savings;
    });
  };

  update();
})

.controller('MainCtrl', function($scope, DB, Auth) {
  $scope.data = {
    amount: null,
    cents: null
  };

  $scope.saveIncome = function() {
    var transaction = $scope.data;

    if(!transaction.amount && !transaction.cents) return;

    if(!transaction.cents) transaction = transaction.amount;
    else if(!transaction.amount) transaction = transaction.cents / 100;
    else transaction = transaction.amount + (transaction.cents / 100);

    $scope.user.savings += transaction;

    Auth.updateFinance($scope.user.id, $scope.user.income, $scope.user.savings).then(function() {
      $scope.data = {
        amount: null,
        cents: null
      };
    });
  };

  $scope.dropTables = function() {
    DB.dropTables();
  };
})

.controller('TransactionCtrl', function($scope, $state, $ionicHistory, WalletService) {
  WalletService.find().then(function(wallets) {
    $scope.data = {
      wallet: wallets[0].walletId,
      amount: null,
      cents: null
    };

    $scope.wallets = wallets;
  });

  $scope.newTransaction = function() {
    var transaction = $scope.data;

    if(!transaction.amount && !transaction.cents) return;

    if(!transaction.cents) transaction = transaction.amount;
    else if(!transaction.amount) transaction = transaction.cents / 100;
    else transaction = transaction.amount + (transaction.cents / 100);

    WalletService.addTransaction($scope.data.wallet, transaction).then(function() {
      $ionicHistory.nextViewOptions({
        disableBack: true,
        disableAnimate: true
      });
      $state.go('inside.wallets');
    });
  };
})

.controller('OCRCtrl', function($scope, $q, $cordovaCamera) {
  /*var getImage = function() {
    var deferred = $q.defer();

    var options = {
        quality: 100,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation:true
    };

    $cordovaCamera.getPicture(options).then(function(imageData) {
      var image = document.getElementById('ocrImg');
      image.src = "data:image/jpeg;base64," + imageData;
      deferred.resolve(image);
    }, function(err) {
      deferred.reject(err.message);
    });

    return deferred.promise;
  };

  $scope.testOCR = function() {
    getImage().then(function(image) {
      OCRAD(image, function(text) {
        console.log(text);
        alert(text);
      });
    });
  };*/
})

.controller('IncomeCtrl', function($scope, Auth, $ionicHistory, $state) {
  $scope.updateIncome = function() {
    Auth.updateFinance($scope.user.id, $scope.user.income, $scope.user.savings).then(function() {
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
    console.log($scope.wallet.icon);

    var name = $scope.wallet.name;
    var budget = $scope.wallet.budget;
    var icon = $scope.wallet.icon || '';

    if(!name || !budget) return;

    WalletService.insert(name, budget, icon).then(function() {
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
    walletId: 0
  };

  $scope.data = {
    amount: null,
    cents: null
  };

  $scope.max = $scope.wallet.budget;
  $scope.current = $scope.wallet.spent;

  var update = function() {
    WalletService.findOne($stateParams.walletId).then(function(result) {
      $scope.wallet = result;
      $scope.data = {
        amount: null,
        cents: null
      };
    });
  };

  $scope.newTransaction = function() {
    var transaction = $scope.data;

    if(!transaction.amount && !transaction.cents) return;

    if(!transaction.cents) transaction = transaction.amount;
    else if(!transaction.amount) transaction = transaction.cents / 100;
    else transaction = transaction.amount + (transaction.cents / 100);

    console.log(transaction);

    WalletService.addTransaction($scope.wallet.walletId, transaction).then(function() {
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
