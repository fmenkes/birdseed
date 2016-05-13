// Custom filter that displays a number if it is whole or shows two decimal
// places if not.

angular.module('client')

.filter('numberFormat', function($filter) {
  return function(input) {
    if (isNaN(input)) return input;
    return input % 1 === 0 ? input : parseFloat(input).toFixed(2);
  };
});
