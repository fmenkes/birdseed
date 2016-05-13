angular.module('client')

.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated'
})

.constant('API_ENDPOINT_URL', {
   mobile: 'http://192.168.0.2:8080/api',
   //mobile: 'https://fierce-lake-67848.herokuapp.com/api',
   browser: 'http://localhost:8100/api'
})

.value('API_ENDPOINT', {
  url: 'http://localhost:8100/api'
})

.value('user', {
  id: ''
});
