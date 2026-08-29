'use strict'

const assert = require('assert')
const crypto = require('crypto')
const FlittPay = require('../lib')

function createClient () {
  return new FlittPay({
    merchantId: 1549901,
    secretKey: 'test',
    creditKey: 'testcredit'
  })
}

describe('Python SDK 2.0 API parity', function () {
  it('creates Open Banking checkout data without mutating the input', async function () {
    const flitt = createClient()
    flitt._request = options => Promise.resolve(options)
    const input = { currency: 'GEL', amount: 10000, payment_method: 'tbc' }

    const result = await flitt.OpenBanking(input)

    assert.strictEqual(result.path, 'checkout/url/')
    assert.strictEqual(result.body.payment_systems, 'opb')
    assert.strictEqual(result.body.payment_method, 'tbc')
    assert.strictEqual(result.body.merchant_id, 1549901)
    assert.strictEqual(Object.prototype.hasOwnProperty.call(input, 'order_id'), false)
  })

  it('validates Open Banking and installments payment methods', function () {
    const flitt = createClient()

    assert.throws(() => flitt.OpenBanking({ payment_method: 'tbc' }), /amount is required/)
    assert.throws(() => flitt.OpenBanking({ amount: 100, currency: 'GEL', payment_method: 'invalid' }), /Incorrect payment_method/)
    assert.throws(() => flitt.Installments({ amount: 5000, currency: 'GEL', payment_method: 'bog' }), /Incorrect payment_method/)
  })

  it('creates installments checkout data', async function () {
    const flitt = createClient()
    flitt._request = options => Promise.resolve(options)

    const result = await flitt.Installments({ currency: 'GEL', amount: 5000 })

    assert.strictEqual(result.path, 'checkout/url/')
    assert.strictEqual(result.body.payment_systems, 'installments')
    assert.strictEqual(result.body.payment_method, 'x')
  })

  it('uses the payout key for IBAN credit', async function () {
    const flitt = createClient()
    flitt._request = options => Promise.resolve(options)
    const input = { currency: 'GEL', amount: 100, receiver_iban: 'GE00TB0000000000000001' }

    const result = await flitt.Ibancredit(input)

    assert.strictEqual(result.path, 'ibancredit/')
    assert.strictEqual(result.credit, true)
    assert.strictEqual(result.body.receiver_iban, input.receiver_iban)
    assert.strictEqual(Object.prototype.hasOwnProperty.call(input, 'order_id'), false)
  })

  it('captures the status amount net of client fee', async function () {
    const flitt = createClient()
    flitt.Status = data => Promise.resolve({
      order_id: data.order_id,
      actual_amount: '1000',
      additional_info: { client_fee: '25' }
    })
    flitt.Capture = data => Promise.resolve(data)

    const result = await flitt.CaptureFull({ order_id: 'order-id', currency: 'GEL' })

    assert.strictEqual(result.amount, 975)
    assert.strictEqual(result.currency, 'GEL')
  })

  it('reverses the captured amount net of fees and previous reversals', async function () {
    const flitt = createClient()
    flitt.Status = () => Promise.resolve({
      actual_amount: '1000',
      reversal_amount: '100',
      additional_info: JSON.stringify({ client_fee: '25', capture_amount: '800' })
    })
    flitt.Reverse = data => Promise.resolve(data)

    const result = await flitt.ReverseFull({ order_id: 'order-id', currency: 'GEL' })

    assert.strictEqual(result.amount, 675)
  })

  it('requests fiscal data by order id', async function () {
    const flitt = createClient()
    flitt._request = options => Promise.resolve(options)

    const result = await flitt.FiscalData({ order_id: 'order-id' })

    assert.strictEqual(result.path, 'fiscal_data/')
    assert.strictEqual(result.body.order_id, 'order-id')
  })

  it('exchanges Company Reports credentials for a token and requests a report', async function () {
    const flitt = createClient()
    const calls = []
    flitt._reportsRequest = options => {
      calls.push(options)
      return Promise.resolve(calls.length === 1 ? { token: 'report-token' } : { rows_count: 0 })
    }

    const result = await flitt.CompanyReports({
      application_id: 'application',
      key: 'private-key',
      report_id: 745,
      merchant_id: 1549902
    })

    const tokenRequest = calls[0]
    const reportRequest = calls[1]
    const expectedSignature = crypto.createHash('sha512')
      .update(`private-key|application|${tokenRequest.body.date}`)
      .digest('hex')
    assert.strictEqual(tokenRequest.path, '/authorizer/token/application/get')
    assert.strictEqual(tokenRequest.body.signature, expectedSignature)
    assert.strictEqual(reportRequest.path, '/api/extend/company/report/')
    assert.strictEqual(reportRequest.headers.Authorization, 'Token report-token')
    assert.strictEqual(reportRequest.body.report_id, 745)
    assert.strictEqual(reportRequest.body.merchant_id, 1549902)
    assert.deepStrictEqual(reportRequest.body.filters, [])
    assert.strictEqual(Object.prototype.hasOwnProperty.call(reportRequest.body, 'key'), false)
    assert.strictEqual(result.rows_count, 0)
  })

  it('routes Reports with application credentials to Company Reports', async function () {
    const flitt = createClient()
    flitt.CompanyReports = data => Promise.resolve({ report_id: data.report_id })

    const result = await flitt.Reports({
      application_id: 'application',
      key: 'private-key',
      report_id: 745
    })

    assert.strictEqual(result.report_id, 745)
  })

  it('keeps removed methods available for backward compatibility', function () {
    const flitt = createClient()

    assert.strictEqual(typeof flitt.TransactionList, 'function')
    assert.strictEqual(typeof flitt.Reports, 'function')
    assert.strictEqual(typeof flitt.LegacyReports, 'function')
  })
})
