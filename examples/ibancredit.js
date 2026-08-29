'use strict'

const FlittPay = require('../lib')

const flitt = new FlittPay({
  merchantId: Number(process.env.FLITT_MERCHANT_ID || 1549901),
  secretKey: process.env.FLITT_SECRET_KEY || 'test',
  creditKey: process.env.FLITT_CREDIT_KEY || 'testcredit'
})

flitt.Ibancredit({
  order_desc: 'IBAN withdrawal',
  currency: 'GEL',
  amount: 10000,
  receiver_iban: process.env.FLITT_RECEIVER_IBAN || 'GE00TB0000000000000001'
}).then(data => {
  console.log(data)
}).catch(error => {
  console.error(error)
})
