describe("RegisterCtrl", function () {

  var $scope,
  ctrl,
  deferredRegister,
  authServiceMock;

  beforeEach(function () {
    module("client");

    // INJECT! This part is critical
    // $rootScope - injected to create a new $scope instance.
    // $controller - injected to create an instance of our controller.
    // $httpBackend - injected so we can ignore GET requests.
    // $q - injected so we can create promises for our mocks.
    inject(function ($rootScope, $httpBackend, $controller, $q) {
      deferredRegister = $q.defer();

      // create a scope object for us to use.
      $scope = $rootScope.$new();

      // Ignore GET calls
      $httpBackend.when('GET', /^templates\//).respond(function() {});

      authServiceMock = {
        register: jasmine.createSpy('register spy').and.returnValue(deferredRegister.promise)
      };

      // mock $state
      stateMock = jasmine.createSpyObj('$state spy', ['go']);

      // mock $ionicPopup
      ionicPopupMock = jasmine.createSpyObj('$ionicPopup spy', ['alert']);

      // now run that scope through the controller function,
      // injecting any services or other injectables we need.
      // **NOTE**: this is the only time the controller function
      // will be run, so anything that occurs inside of that
      // will already be done before the first spec.
      ctrl = $controller("RegisterCtrl", {
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

  describe('#register', function() {
    // Call register before each test
    beforeEach(function() {
      $scope.user = {
        username: 'test1',
        password: 'password1',
        email: 'test@email.com'
      };
      $scope.register();
    });

    it('should call register on authService', function() {
      expect(authServiceMock.register).toHaveBeenCalledWith({
        username: 'test1',
        password: 'password1',
        email: 'test@email.com'
      });
    });

    describe('when registered, ', function() {
			it('if successful, should change state to outside.login and show a popup', function() {

				deferredRegister.resolve();
				$scope.$digest();

        expect(ionicPopupMock.alert).toHaveBeenCalled();
				expect(stateMock.go).toHaveBeenCalledWith('outside.login');
			});

			it('if unsuccessful, should show a popup explaining the error', function() {

				deferredRegister.reject({ code: 11000 });
				$scope.$digest();

				expect(ionicPopupMock.alert).toHaveBeenCalledWith({
          title: 'Registration failed',
          template: 'Username or email already in use.'
        });
        expect(stateMock.go).not.toHaveBeenCalled();
			});
		});
  });
});
