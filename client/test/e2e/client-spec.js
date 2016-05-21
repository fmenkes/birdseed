describe('E2E tests', function() {
  var login = function() {
    element(by.id('username')).sendKeys("francis");
    element(by.id('password')).sendKeys("francis");
    element(by.id('loginButton')).click();
  };

  var loginIncorrect = function() {
    element(by.id('username')).sendKeys("wronguser");
    element(by.id('password')).sendKeys("wrongpassword");
    element(by.id('loginButton')).click();
  };

  beforeEach(function() {
    browser.get('http://localhost:8100/');
  });

  describe('Login page', function() {
    it('should show a popup on failed log in', function() {
      loginIncorrect();

      expect(element(by.css('.popup-body span')).getText()).toEqual('Authentication failed. User not found.');
    });

    it('should be able to log in', function() {
      var loginUrl = browser.getCurrentUrl();

      login();

      expect(browser.getCurrentUrl()).not.toEqual(loginUrl);
    });
  });

  describe('Wallets', function() {
    it('should create a new wallet', function() {
      // Clunky but necessary or it will find the cached version of the menu button
      element(by.xpath("//*[@nav-bar='active']//*//div//span//button")).click();
      element(by.cssContainingText('.item', 'Wallets')).click();
      element(by.buttonText('Create new Wallet')).click();
      element(by.model('wallet.name')).sendKeys('test');
      element(by.model('wallet.budget')).sendKeys('2000');
      element(by.buttonText('Save')).click();

      var list = element.all(by.css('.list li'));
      expect(list.count()).toEqual(1);
    });

    it('should be able to delete wallet', function() {
      element(by.xpath("//*[@nav-bar='active']//*//div//span//button")).click();
      element(by.cssContainingText('.item', 'Wallets')).click();

      var list = element.all(by.css('.list li'));
      expect(list.count()).toEqual(1);

      element(by.cssContainingText('.item', 'test')).click();
      element(by.buttonText('Delete wallet')).click();
      element(by.buttonText('OK')).click();

      list = element.all(by.css('.list li'));
      expect(list.count()).toEqual(0);
    });
  });

  describe('Trophies', function() {
    it('should have a trophy for creating a wallet', function() {
      element(by.xpath("//*[@nav-bar='active']//*//div//span//button")).click();

      element(by.cssContainingText('.item', 'Trophies')).click();

      var row = element.all(by.css('.trophies div img'));
      expect(row.count()).toEqual(1);

      row.get(0).click();

      expect(element(by.css('.popup-title')).getText()).toEqual('firstWallet');
    });
  });

  describe('Transactions', function() {
    it('should be able to add a transaction through wallet page', function() {
      var active = element(by.xpath("//*[@nav-view='active']"));

      element(by.xpath("//*[@nav-bar='active']//*//div//span//button")).click();
      element(by.cssContainingText('.item', 'Wallets')).click();
      element(by.buttonText('Create new Wallet')).click();
      element(by.model('wallet.name')).sendKeys('Test');
      element(by.model('wallet.budget')).sendKeys('2000');
      element(by.buttonText('Save')).click();

      list = element.all(by.css('.list li'));
      expect(list.count()).toEqual(1);

      list.get(0).click();

      active.element(by.model('data.amount')).sendKeys('1000');
      element(by.buttonText('Save transaction')).click();

      expect(element(by.css('.progress-data span')).getText()).toEqual('1000 / 2000');
    });
  });
});
