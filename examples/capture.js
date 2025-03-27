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
  amount: '1000',
  card_number: '4444555511116666',
  cvv2: '333',
  expiry_date: '1232',
  preauth: 'Y'
}
flitt.PciDssOne(data).then(data => {
  const captureData = {
    currency: 'GEL',
    amount: '1000',
    order_id: data.order_id
  }
  flitt.Capture(captureData).then(data => {
    console.log(data)
  })
})
