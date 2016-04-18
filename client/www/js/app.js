// Angular app
angular.module('client', ['ionic', 'ngCordova'])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
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
    templateUrl: 'templates/inside.html'
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
  });

  $urlRouterProvider.otherwise('/outside/login');
})

.run(function($ionicPlatform, $rootScope, $state, $cordovaSQLite, AuthService, AUTH_EVENTS) {
  // Detect when user tries to somehow navigate to a restricted area while logged out
  // and redirected them to the login page.
  $rootScope.$on('$stateChangeStart', function(event, next, nextParams, fromState) {
    if(!AuthService.isAuthenticated()) {
      console.log(next.name);
      if(next.name !== 'outside.login' && next.name !== 'outside.register') {
        event.preventDefault();
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

    // local database for tokens. Commented out because it will cause e2e tests to fail.
    /*var db = $cordovaSQLite.openDB("local.db");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS tokens (id integer primary key, token text)");*/
  });
});
