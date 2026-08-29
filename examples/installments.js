'use strict'

const FlittPay = require('../lib')

const flitt = new FlittPay({
  merchantId: Number(process.env.FLITT_MERCHANT_ID || 1549901),
  secretKey: process.env.FLITT_SECRET_KEY || 'test'
})

flitt.Installments({
  order_desc: 'Installments order',
  currency: 'GEL',
  amount: 5000,
  payment_method: 'tbc'
}).then(data => {
  console.log(data.checkout_url)
}).catch(error => {
  console.error(error)
})
