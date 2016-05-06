describe("LoginCtrl", function () {

  var $scope,
  ctrl,
  deferredLogin,
  authServiceMock,
  $timeout;

  beforeEach(function () {

    module("client");

    // INJECT! This part is critical
    // $rootScope - injected to create a new $scope instance.
    // $controller - injected to create an instance of our controller.
    // $httpBackend - injected so we can ignore GET requests.
    // $q - injected so we can create promises for our mocks.
    // _$timeout_ - injected to we can flush unresolved promises.
    inject(function ($rootScope, $httpBackend, $controller, $q, _$timeout_) {
      deferredLogin = $q.defer();

      // create a scope object for us to use.
      $scope = $rootScope.$new();

      // Ignore GET calls
      $httpBackend.when('GET', /^templates\//).respond(function() {});

      authServiceMock = {
        login: jasmine.createSpy('login spy').and.returnValue(deferredLogin.promise)
      };

      // mock $state
      stateMock = jasmine.createSpyObj('$state spy', ['go']);

      // mock $ionicPopup
      ionicPopupMock = jasmine.createSpyObj('$ionicPopup spy', ['alert']);

      // assign $timeout to a scoped variable so we can use
      // $timeout.flush() later. Notice the _underscore_ trick
      // so we can keep our names clean in the tests.
      $timeout = _$timeout_;

      // now run that scope through the controller function,
      // injecting any services or other injectables we need.
      // **NOTE**: this is the only time the controller function
      // will be run, so anything that occurs inside of that
      // will already be done before the first spec.
      ctrl = $controller("LoginCtrl", {
        $state: stateMock,
        $ionicPopup: ionicPopupMock,
        AuthService: authServiceMock,
        $scope: $scope
      });
    });

  });


  // Test 1: The simplest of the simple.
  // here we're going to make sure the $scope variable
  // exists evaluated.
  it("should have a $scope variable", function() {
    expect($scope).toBeDefined();
  });

  describe("#login", function() {
    // call login on the controller for every test
    beforeEach(function() {
      $scope.user = {
        username: 'test1',
        password: 'password1',
        email: 'test@email.com'
      };
      $scope.login();
    });

    it('should call login on authService', function() {
			expect(authServiceMock.login).toHaveBeenCalledWith({
        username: 'test1',
        password: 'password1',
        email: 'test@email.com'
      });
		});

    describe('when the login is executed,', function() {
			it('if successful, should change state to inside.main', function() {

				deferredLogin.resolve();
				$scope.$digest();

				expect(stateMock.go).toHaveBeenCalledWith('inside.main');
			});

			it('if unsuccessful, should show a popup', function() {

				deferredLogin.reject();
				$scope.$digest();

				expect(ionicPopupMock.alert).toHaveBeenCalled();
			});
		});
  });
});
