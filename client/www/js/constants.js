angular.module('client')

.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated'
})

.constant('API_ENDPOINT_URL', {
   //mobile: 'http://192.168.0.4:8080/api',
   mobile: 'https://fierce-lake-67848.herokuapp.com/api',
   browser: 'http://localhost:8100/api'
})

.constant('ICONS', [
  'home',
  'bill',
  'car',
  'groceries',
  'dog',
  'dining_room',
  'baby',
  'star',
  'beer',
  'wine_glass',
  'shirt',
  'wedding_dress',
  'credit_card',
  'electricity',
  'gas',
  'water',
  'airplane',
  'bus',
  'bicycle',
  'clinic',
  'controller',
  'face_powder',
  'barbershop',
  'movie_projector',
  'literature',
  'guitar',
  'safe',
  'banknotes',
  'gift',
  'notebook',
  'pizza',
  'cards',
  'broom',
  'male',
  'female',
  'chicken',
  'chili_pepper',
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
    desc: "You reached a wallet limit! Just try not to go over!"
  },
  { name: 'setIncome',
    plainName: 'Update your finances',
    desc: 'You your income and/or account info! Make sure you update it when you get a raise!'
  },
  {
    name: 'firstMonth',
    plainName: 'Your first month',
    desc: 'You made it to the end of the first month!'
  },
  {
    name: 'threeMonths',
    plainName: 'Three months and going',
    desc: "You've been using BudgetBuddy for three months! Wow!"
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
