angular.module('client')

.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated'
})

// This won't work on mobile. Instead we need to find the IP of the computer
// on the wireless network, or put the server online.
.constant('API_ENDPOINT', {
  url: 'http://127.0.0.1:8080/api'
});
