describe('login page', function() {
  it('should show the correct text', function() {
    browser.get('http://localhost:8100');

    element(by.id('testButton')).click();

    expect(element(by.id('testText')).getText()).toEqual('test');
  });
});
