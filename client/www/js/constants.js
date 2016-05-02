angular.module('client')

.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated'
})

.constant('API_ENDPOINT_URL', {
   mobile: 'https://fierce-lake-67848.herokuapp.com/api',
   browser: 'http://localhost:8100/api'
})

.value('API_ENDPOINT', {
  url: 'http://localhost:8100/api'
});
