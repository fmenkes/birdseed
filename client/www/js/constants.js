angular.module('client')

.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated'
})

.constant('API_ENDPOINT_URL', {
   mobile: 'http://192.168.0.2:8080/api',
   //mobile: 'https://fierce-lake-67848.herokuapp.com/api',
   browser: 'http://localhost:8100/api'
})

.constant('ICONS', [
  'home', 'bill', 'car', 'dog', 'groceries', 'male', 'female', 'star'
])

.constant('TROPHIES', [
  { name: 'firstWallet',
    plainName: 'First wallet',
    desc: "You've created your first wallet!"
  },
  { name: 'fiveWallets',
    plainName: 'Five wallets',
    desc: "You've created five wallets! Diligent!"
  },
  { name: 'fullWallet',
    plainName: 'Full up',
    desc: "You reached a wallet limit! That's OK, next time you'll do better."
  },
  { name: 'setIncome',
    plainName: 'Set your income',
    desc: 'You set your monthly income! Make sure you update it when you get a raise!'
  }
])

.value('chosen_icon', {
  name: ''
})

.value('API_ENDPOINT', {
  url: 'http://localhost:8100/api'
})

.value('user', {
  id: ''
});
