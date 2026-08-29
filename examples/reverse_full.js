'use strict'

const FlittPay = require('../lib')

const orderId = process.env.FLITT_ORDER_ID
if (!orderId) {
  throw new Error('Set FLITT_ORDER_ID to an authorized order')
}

const flitt = new FlittPay({
  merchantId: Number(process.env.FLITT_MERCHANT_ID || 1549901),
  secretKey: process.env.FLITT_SECRET_KEY || 'test'
})

flitt.ReverseFull({
  order_id: orderId,
  currency: process.env.FLITT_CURRENCY || 'GEL'
}).then(data => {
  console.log(data)
}).catch(error => {
  console.error(error)
})
