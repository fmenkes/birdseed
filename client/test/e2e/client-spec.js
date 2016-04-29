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

  it('should create a new budget', function() {
    element(by.buttonText('Manage my budgets')).click();
    element(by.buttonText('Create new Budget')).click();
    element(by.id('budgetName')).sendKeys('test');
    element(by.buttonText('Save')).click();

    var list = element.all(by.css('.list li'));
    expect(list.count()).toEqual(1);
  });
});
