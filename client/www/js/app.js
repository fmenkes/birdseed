// Angular app
angular.module('client', ['ionic', 'ngCordova'])

.config(function($stateProvider, $urlRouterProvider) {
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
  .state('inside.budget', {
    url: '/budget',
    templateUrl: 'templates/budget.html',
    controller: 'BudgetCtrl'
  })
  .state('inside.trophies', {
    url: '/trophies',
    templateUrl: 'templates/trophies.html'
  });

  $urlRouterProvider.otherwise('/home');
})

.run(function($ionicPlatform,
              $ionicHistory,
              $rootScope,
              $state,
              $timeout,
              $location,
              $cordovaSQLite,
              DB,
              AuthService,
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

    DB.init();
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
/*
    if (AuthService.isAuthenticated()) {
      $timeout(function() {
        $location.path('/inside/main');
        $rootScope.$apply();
      });
    }
    else {
      $timeout(function() {
        $location.path('/outside/login');
        $rootScope.$apply();
      });
    }*/
  });
});
