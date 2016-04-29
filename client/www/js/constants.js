angular.module('client')

.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated'
})

.constant('API_ENDPOINT_URL', {
   mobile: 'http://192.168.0.7:8080/api',
   browser: 'http://localhost:8100/api'
})

.value('API_ENDPOINT', {
  url: 'http://localhost:8100/api'
});
