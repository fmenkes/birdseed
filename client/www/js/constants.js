angular.module('client')

.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated'
})

.constant('API_ENDPOINT_URL', {
   mobile: 'http://192.168.0.7:8080/api',
   browser: 'http://127.0.0.1:8080/api'
})

.value('API_ENDPOINT', {
  url: 'http://127.0.0.1:8080/api'
});
