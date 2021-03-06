// Angular app
angular.module('client', ['ionic', 'ngCordova', 'angular-svg-round-progressbar'])

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $stateProvider
  // Loading page.
  .state('home', {
    url: '/home',
    templateUrl: 'templates/home.html'
  })
  .state('outside', {
    url: '/outside',
    abstract: true,
    templateUrl: 'templates/outside.html'
  })
  .state('outside.login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })
  .state('outside.register', {
    url: '/register',
    templateUrl: 'templates/register.html',
    controller: 'RegisterCtrl'
  })
  .state('inside', {
    url: '/inside',
    abstract: true,
    templateUrl: 'templates/inside.html',
    controller: 'InsideCtrl'
  })
  .state('inside.main', {
    url: '/main',
    templateUrl: 'templates/main.html',
    controller: 'MainCtrl'
  })
  .state('inside.wallets', {
    cache: false,
    url: '/wallets',
    templateUrl: 'templates/wallets.html',
    controller: 'WalletsCtrl'
  })
  .state('inside.new_wallet', {
    url: '/new_wallet',
    templateUrl: 'templates/new_wallet.html',
    controller: 'NewWalletCtrl'
  })
  .state('inside.choose_icon', {
    url: '/choose_icon',
    templateUrl: 'templates/choose_icon.html',
    controller: 'ChooseIconCtrl'
  })
  .state('inside.wallet_detail', {
    cache: false,
    url: '/wallet/:walletId',
    templateUrl: 'templates/wallet_detail.html',
    controller: 'WalletDetailCtrl'
  })
  .state('inside.income', {
    url: '/income',
    templateUrl: 'templates/income.html',
    controller: 'IncomeCtrl'
  })
  .state('inside.trophies', {
    cache: false,
    url: '/trophies',
    templateUrl: 'templates/trophies.html',
    controller: 'TrophiesCtrl'
  })
  .state('inside.transaction', {
    cache: false,
    url: '/transaction',
    templateUrl: 'templates/transaction.html',
    controller: 'TransactionCtrl'
  });

  $urlRouterProvider.otherwise('/home');

  $ionicConfigProvider.backButton.previousTitleText(true);
})

.run(function($ionicPlatform,
  $ionicHistory,
  $rootScope,
  $state,
  $timeout,
  $location,
  $cordovaSQLite,
  $cordovaLocalNotification,
  DB,
  AuthService,
  MonthlyService,
  API_ENDPOINT_URL,
  API_ENDPOINT,
  AUTH_EVENTS) {
    // Detect when user tries to somehow navigate to a restricted area while logged out
    // and redirect them to the login page.
    $rootScope.$on('$stateChangeStart', function(event, next, nextParams, fromState) {
      if(!AuthService.isAuthenticated()) {
        console.log(next.name);
        if(next.name !== 'outside.login' && next.name !== 'outside.register' && next.name !== 'home') {
          event.preventDefault();
          $ionicHistory.nextViewOptions({
            disableBack: true,
            disableAnimate: true
          });
          $state.go('outside.login');
        }
      }
    });

    $ionicPlatform.ready(function() {
      if(window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }

      // Set the API endpoint depending on if we're on mobile or browser
      if(ionic.Platform.isAndroid() || ionic.Platform.isIOS()) {
        API_ENDPOINT.url = API_ENDPOINT_URL.mobile;
      } else {
        API_ENDPOINT.url = API_ENDPOINT_URL.browser;
      }

      // Initialize database
      DB.init().then(function(message) {
        console.log(message);

        AuthService.loadUserCredentials().then(function() {
          $timeout(function() {
            $location.path('/inside/main');
            $rootScope.$apply();
          });
        }, function() {
          $timeout(function() {
            $location.path('/outside/login');
            $rootScope.$apply();
          });
        });
      }, function(e) {
        throw e;
      });
    });
  });
