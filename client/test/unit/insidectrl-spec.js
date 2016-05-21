describe("InsideCtrl", function () {

  var $scope,
  ctrl,
  authMock;

  beforeEach(function () {
    module("client");

    // INJECT! This part is critical
    // $rootScope - injected to create a new $scope instance.
    // $controller - injected to create an instance of our controller.
    // $httpBackend - injected so we can ignore GET requests.
    // $q - injected so we can create promises for our mocks.
    inject(function ($rootScope, $httpBackend, $controller, $q) {
      deferredGet = $q.defer();

      // create a scope object for us to use.
      $scope = $rootScope.$new();

      // Ignore GET calls
      $httpBackend.when('GET', /^templates\//).respond(function() {});

      authMock = {
        getUser: jasmine.createSpy('getUser spy').and.returnValue(deferredGet.promise)
      };

      authServiceMock = {
        logout: jasmine.createSpy('logout spy')
      };

      // mock $state
      stateMock = jasmine.createSpyObj('$state spy', ['go']);

      userMock = {
        id: 123
      };

      // now run that scope through the controller function,
      // injecting any services or other injectables we need.
      // **NOTE**: this is the only time the controller function
      // will be run, so anything that occurs inside of that
      // will already be done before the first spec.
      ctrl = $controller("InsideCtrl", {
        $state: stateMock,
        Auth: authMock,
        AuthService: authServiceMock,
        user: userMock,
        $scope: $scope
      });
    });

  });

  it("should have a $scope variable", function() {
    expect($scope).toBeDefined();
  });

  describe('#update', function() {
    it('should get the user when instantiated', function() {
      expect(authMock.getUser).toHaveBeenCalledWith(123);
    });
  });

  describe('#logout', function() {
    beforeEach(function() {
      $scope.logout();
    });

    it('should call logout on authService', function() {
      expect(authServiceMock.logout).toHaveBeenCalled();
    });

    it('should change state', function() {
      expect(stateMock.go).toHaveBeenCalledWith('outside.login');
    });
  });
});
