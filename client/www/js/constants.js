angular.module('client')

.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated'
})

// This won't work on mobile. Instead we need to find the IP of the computer
// on the wireless network, or put the server online.
// TODO: make this automatic if possible
.constant('API_ENDPOINT', {
  //url: 'http://127.0.0.1:8080/api'
   url: 'http://192.168.0.7:8080/api'
});
