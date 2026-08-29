'use strict'

const FlittPay = require('../lib')

const flitt = new FlittPay({
  merchantId: Number(process.env.FLITT_MERCHANT_ID || 1549901),
  secretKey: process.env.FLITT_SECRET_KEY || 'test'
})

flitt.OpenBanking({
  order_desc: 'Open Banking order',
  currency: 'GEL',
  amount: 10000,
  payment_method: 'tbc'
}).then(data => {
  // Pass this URL unmodified after an explicit user action. Confirm the
  // payment using the server callback or flitt.Status().
  console.log(data.checkout_url)
}).catch(error => {
  console.error(error)
})
