describe('login page', function() {
  var login = function() {
    element(by.id('username')).sendKeys("francis");
    element(by.id('password')).sendKeys("francis");
    element(by.id('loginButton')).click();
  };

  beforeEach(function() {
    browser.get('http://localhost:8100/');
  });

  it('should be able to log in', function() {
    var loginUrl = browser.getCurrentUrl();

    login();

    expect(browser.getCurrentUrl()).not.toEqual(loginUrl);
  });

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
});
