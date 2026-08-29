'use strict'

const FlittPay = require('../lib')

const flitt = new FlittPay(
  {
    // Merchant credentials are required by the shared client constructor but
    // are not used to authenticate Company Reports.
    merchantId: Number(process.env.FLITT_MERCHANT_ID || 1549901),
    secretKey: process.env.FLITT_SECRET_KEY || 'test',
    reportsBaseUrl: process.env.FLITT_REPORTS_DOMAIN || 'portal.flitt.com'
  }
)

const data = {
  application_id: process.env.FLITT_REPORTS_APPLICATION_ID || '1019',
  key: process.env.FLITT_REPORTS_KEY || 'test',
  report_id: 745,
  merchant_id: Number(process.env.FLITT_REPORTS_MERCHANT_ID || 1549902),
  filters: []
}

flitt.CompanyReports(data).then(data => {
  console.log(data)
}).catch((error) => {
  console.error(error)
})
