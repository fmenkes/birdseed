// Custom directive for showing how much space is used in a wallet

angular.module('client')

.directive('walletProgress', function() {
  return {
    scope: {
      wallet: "=wallet"
    },
    link: function(scope, element, attr) {
      // Set the width to be the percent spent
      var width = (scope.wallet.spent / scope.wallet.budget) * 100;
      // Restrict it to 100
      width = width > 100 ? 100 : width;
      // Set the color of the bar depending on the width of the bar
      var color;
      if(width < 50) {
        color = 'green';
      } else if(width < 75) {
        color = 'yellow';
      } else {
        color = 'red';
      }

      // Set the element css
      element.css({
       width: width + '%',
       height: '4px',
       backgroundColor: color,
       display: 'block'
      });
    }
  };
});
