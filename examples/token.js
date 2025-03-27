'use strict'

const FlittPay = require('../lib')

const flitt = new FlittPay(
  {
    merchantId: 1549901,
    secretKey: 'test'
  }
)
const data = {
  order_desc: 'test order',
  currency: 'GEL',
  amount: '1000'
}
flitt.CheckoutToken(data).then(data => {
  console.log(data)
}).catch((error) => {
  console.log(error)
})
