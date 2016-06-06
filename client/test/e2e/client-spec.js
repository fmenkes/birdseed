describe('E2E tests', function() {
  var EC = protractor.ExpectedConditions;

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

  describe('Register page', function() {
    describe('should show the correct error message when', function() {
      beforeEach(function() {
        element(by.buttonText('Register')).click();
      });

      it('entering a username in use', function() {
        element(by.id('usernameRegister')).sendKeys("francis");
        element(by.id('passwordRegister')).sendKeys("francis");
        element(by.id('email')).sendKeys("fake@fake.com");

        element(by.xpath("//*[@nav-view='active']")).element(by.buttonText('Register')).click();

        expect(element(by.css('.popup-body span')).getText()).toEqual('Username already in use.');
      });

      it('entering an email already in use', function() {
        element(by.id('usernameRegister')).sendKeys("wronguser");
        element(by.id('passwordRegister')).sendKeys("wrongpassword");
        element(by.id('email')).sendKeys("francis.menkes@gmail.com");

        element(by.xpath("//*[@nav-view='active']")).element(by.buttonText('Register')).click();

        expect(element(by.css('.popup-body span')).getText()).toEqual('Email already in use.');
      });

      it('entering an invalid email', function() {
        element(by.id('usernameRegister')).sendKeys("wronguser");
        element(by.id('passwordRegister')).sendKeys("wrongpassword");
        element(by.id('email')).sendKeys("ffff");

        element(by.xpath("//*[@nav-view='active']")).element(by.buttonText('Register')).click();

        expect(element(by.css('.popup-body span')).getText()).toEqual('Please enter a valid email.');
      });
    });
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

      var wallets = element.all(by.repeater('wallet in wallets'));

      browser.wait(EC.presenceOf($('.wallet-info')), 500);

      expect(wallets.count()).toEqual(1);
    });

    it('should be able to delete wallet', function() {
      element(by.xpath("//*[@nav-bar='active']//*//div//span//button")).click();
      element(by.cssContainingText('.item', 'Wallets')).click();

      var walletList = element.all(by.repeater('wallet in wallets'));
      expect(walletList.count()).toEqual(1);

      element(by.cssContainingText('.item', 'test')).click();
      element(by.buttonText('Delete wallet')).click();
      element(by.buttonText('OK')).click();

      walletList = element.all(by.repeater('wallet in wallets'));
      expect(walletList.count()).toEqual(0);
    });
  });

  describe('Trophies', function() {
    it('should have a trophy for creating a wallet', function() {
      element(by.xpath("//*[@nav-bar='active']//*//div//span//button")).click();

      element(by.cssContainingText('.item', 'Trophies')).click();

      var row = element.all(by.css('.trophies div img'));
      expect(row.count()).toEqual(1);

      row.get(0).click();

      expect(element(by.css('.popup-title')).getText()).toEqual('First wallet');
    });
  });

  describe('Transactions', function() {
    it('should be able to add a transaction through wallet page', function() {
      element(by.xpath("//*[@nav-bar='active']//*//div//span//button")).click();
      element(by.cssContainingText('.item', 'Wallets')).click();
      element(by.buttonText('Create new Wallet')).click();
      element(by.model('wallet.name')).sendKeys('Test');
      element(by.model('wallet.budget')).sendKeys('2000');
      element(by.buttonText('Save')).click();

      var walletList = element.all(by.repeater('wallet in wallets'));

      browser.wait(EC.presenceOf($('.wallet-info')), 500);

      expect(walletList.count()).toEqual(1);

      walletList.get(0).click();

      var activeView = element(by.xpath("//*[@nav-view='active']"));
      activeView.element(by.model('data.amount')).sendKeys('1000');

      element(by.buttonText('Save transaction')).click();

      expect(element(by.css('.progress-data span')).getText()).toEqual('1000 / 2000');
    });

    it('should be able to add a transaction through dashboard', function() {
      element(by.buttonText('New transaction')).click();

      var activeView = element(by.xpath("//*[@nav-view='active']"));
      activeView.element(by.model('data.amount')).sendKeys('500');

      element(by.buttonText('Save')).click();

      var walletList = element.all(by.repeater('wallet in wallets'));

      browser.wait(EC.presenceOf($('.wallet-info')), 500);

      walletList.get(0).click();

      expect(element(by.css('.progress-data span')).getText()).toEqual('1500 / 2000');
    });
  });

  describe('Accounts', function() {
    it('should have the correct amount in the account and income', function() {
      element(by.model('user.savings')).getAttribute('value').then(function(value) {
        expect(value).toEqual('-1500');
      });
      element(by.model('user.income')).getAttribute('value').then(function(value) {
        expect(value).toEqual('0');
      });
    });

    it('should get a trophy popup on saving finance info', function() {
      element(by.model('user.savings')).
        sendKeys(protractor.Key.chord(
          protractor.Key.BACK_SPACE,
          protractor.Key.BACK_SPACE,
          protractor.Key.BACK_SPACE,
          protractor.Key.BACK_SPACE,
          protractor.Key.BACK_SPACE, '20000'));
      element(by.model('user.income')).sendKeys(protractor.Key.chord(protractor.Key.BACK_SPACE, '20000'));

      element(by.cssContainingText('.item', 'Save account information')).click();

      expect(element(by.css('.popup-head h3')).getText()).toEqual('New trophy!');
    });
  });
});
