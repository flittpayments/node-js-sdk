'use strict'

const util = require('./util')
const request = require('./requester')

class FlittPay {
  /**
     * Base class
     * @param protocol
     * @param merchantId
     * @param baseUrl
     * @param reportsBaseUrl
     * @param secretKey
     * @param creditKey
     * @param contentType
     * @param timeout
     */
  constructor ({
    protocol = '1.0',
    merchantId,
    baseUrl = 'pay.flitt.com',
    reportsBaseUrl = 'portal.flitt.com',
    secretKey,
    creditKey,
    contentType = 'json',
    timeout = 60 * 1000
  }) {
    this.config = {
      protocol,
      merchantId,
      baseUrl,
      reportsBaseUrl,
      secretKey,
      creditKey,
      contentType,
      timeout
    }
    if (!this.config.merchantId || isNaN(this.config.merchantId)) throw new Error('Merchant id incorrect')
    if (!this.config.secretKey) throw new Error('Secret Key is empty')
  }

  /**
   * Check data
   * @param data
   * @returns {*}
   */
  getImportantParams (data) {
    data.merchant_id = this.config.merchantId
    return data
  }

  /**
     * Gen order id
     */
  getOrderId () {
    return `${this.config.merchantId}_${util.generateOrderId()}`
  }

  /**
   *
   * @param path
   * @param body
   * @param credit
   * @returns {Promise<any|ParsedUrlQuery>}
   * @private
   */
  async _request ({ path, body = null, credit = false }) {
    const type = this.config.contentType
    const secret = credit ? this.config.creditKey : this.config.secretKey

    const headers = {
      'User-Agent': 'FlittPay-nodejs-sdk',
      'Content-Type': util.getContentHeader(type)
    }

    const options = {
      hostname: this.config.baseUrl,
      port: 443,
      path: `/api/${path}`,
      method: 'POST',
      headers,
      body: util.getConvertedData(type, body, this.config.protocol, secret),
      timeout: this.config.timeout
    }
    const data = await request(options)
    const response = util.getConvertedResponse(type, data, this.config.protocol)
    if (response.error_code) {
      const error = new Error(
        'Response status is failure\n' +
         `error_code: ${response.error_code}\n` +
         `request_id: ${response.request_id}\n` +
         `error_message: ${response.error_message}\n`
      )
      error.response = response
      throw error
    } else {
      return response
    }
  }

  /**
   * Request the Company Reports service without the merchant API envelope.
   * @param path
   * @param body
   * @param headers
   * @returns {Promise<any>}
   * @private
   */
  async _reportsRequest ({ path, body, headers = {} }) {
    const requestHeaders = Object.assign({
      'User-Agent': 'FlittPay-nodejs-sdk',
      'Content-Type': 'application/json'
    }, headers)
    const options = {
      hostname: this.config.reportsBaseUrl,
      port: 443,
      path,
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(body),
      timeout: this.config.timeout
    }
    const data = await request(options)
    return JSON.parse(data)
  }
}

FlittPay.prototype.isValidResponse = function (data, credit = false) {
  return util.validateResponse(data, credit ? this.config.creditKey : this.config.secretKey)
}

FlittPay.prototype.Checkout = function (data) {
  if (!data.order_id) { data.order_id = this.getOrderId() }
  const request = this.getImportantParams(data)

  const options = {
    path: 'checkout/url/',
    body: request
  }

  return this._request(options)
}

FlittPay.prototype.CheckoutToken = function (data) {
  if (!data.order_id) { data.order_id = this.getOrderId() }

  const request = this.getImportantParams(data)

  const options = {
    path: 'checkout/token/',
    body: request
  }

  return this._request(options)
}

FlittPay.prototype.OpenBanking = function (data) {
  requireFields(data, ['amount', 'currency'])
  const paymentMethod = data.payment_method === undefined ? 'x' : data.payment_method
  const allowed = ['tbc', 'bog', 'liberty', 'credo', 'x']
  if (allowed.indexOf(paymentMethod) === -1) {
    throw new Error(`Incorrect payment_method. ${allowed.join(', ')} is allowed`)
  }
  const request = Object.assign({}, data, {
    payment_systems: 'opb',
    payment_method: paymentMethod
  })
  return this.Checkout(request)
}

FlittPay.prototype.Installments = function (data) {
  requireFields(data, ['amount', 'currency'])
  const paymentMethod = data.payment_method === undefined ? 'x' : data.payment_method
  const allowed = ['tbc', 'x']
  if (allowed.indexOf(paymentMethod) === -1) {
    throw new Error(`Incorrect payment_method. ${allowed.join(', ')} is allowed`)
  }
  const request = Object.assign({}, data, {
    payment_systems: 'installments',
    payment_method: paymentMethod
  })
  return this.Checkout(request)
}

FlittPay.prototype.Verification = function (data) {
  if (!data.order_id) { data.order_id = this.getOrderId() }

  data.verification = 'Y'
  if (!data.verification_type) {
    data.verification_type = 'amount'
  }
  if (!data.amount) {
    data.amount = 0
  }
  const request = this.getImportantParams(data)
  const options = {
    path: 'checkout/url/',
    body: request
  }

  return this._request(options)
}

FlittPay.prototype.Capture = function (data) {
  const request = this.getImportantParams(data)
  const options = {
    path: 'capture/order_id/',
    body: request
  }

  return this._request(options)
}

FlittPay.prototype.CaptureFull = function (data) {
  requireFields(data, ['order_id', 'currency'])
  return this.Status({ order_id: data.order_id }).then(status => {
    const additionalInfo = getAdditionalInfo(status)
    const actualAmount = parseInt(status.actual_amount || 0, 10)
    const clientFee = parseInt(additionalInfo.client_fee || 0, 10)
    return this.Capture(Object.assign({}, data, {
      amount: actualAmount - clientFee
    }))
  })
}

FlittPay.prototype.Recurring = function (data) {
  if (!data.order_id) { data.order_id = this.getOrderId() }

  const request = this.getImportantParams(data)
  const options = {
    path: 'recurring/',
    body: request
  }

  return this._request(options)
}

FlittPay.prototype.Reverse = function (data) {
  const request = this.getImportantParams(data)
  const options = {
    path: 'reverse/order_id/',
    body: request
  }

  return this._request(options)
}

FlittPay.prototype.ReverseFull = function (data) {
  requireFields(data, ['order_id', 'currency'])
  return this.Status({ order_id: data.order_id }).then(status => {
    const additionalInfo = getAdditionalInfo(status)
    const actualAmount = parseInt(status.actual_amount || 0, 10)
    const reversalAmount = parseInt(status.reversal_amount || 0, 10)
    const clientFee = parseInt(additionalInfo.client_fee || 0, 10)
    const captureAmount = parseInt(additionalInfo.capture_amount || 0, 10)
    const baseAmount = captureAmount === 0 ? actualAmount : captureAmount
    return this.Reverse(Object.assign({}, data, {
      amount: baseAmount - clientFee - reversalAmount
    }))
  })
}

FlittPay.prototype.Status = function (data) {
  const request = this.getImportantParams(data)
  const options = {
    path: 'status/order_id/',
    body: request
  }

  return this._request(options)
}

FlittPay.prototype.FiscalData = function (data) {
  requireFields(data, ['order_id'])
  const request = this.getImportantParams(Object.assign({}, data))
  const options = {
    path: 'fiscal_data/',
    body: request
  }

  return this._request(options)
}

FlittPay.prototype.P2pcredit = function (data) {
  if (!data.order_id) { data.order_id = this.getOrderId() }

  const request = this.getImportantParams(data)
  const options = {
    path: 'p2pcredit/',
    body: request,
    credit: true
  }

  return this._request(options)
}

FlittPay.prototype.Ibancredit = function (data) {
  requireFields(data, ['amount', 'currency', 'receiver_iban'])
  const requestData = Object.assign({}, data)
  if (!requestData.order_id) { requestData.order_id = this.getOrderId() }

  const request = this.getImportantParams(requestData)
  const options = {
    path: 'ibancredit/',
    body: request,
    credit: true
  }

  return this._request(options)
}

/**
 * @deprecated Removed from the Python SDK in 2.0. Use Status instead.
 */
FlittPay.prototype.TransactionList = function (data) {
  this.config.protocol = '1.0'
  const request = this.getImportantParams(data)
  const options = {
    path: 'transaction_list/',
    body: request
  }

  return this._request(options)
}

FlittPay.prototype.Reports = function (data) {
  const companyReportFields = ['application_id', 'key', 'report_id']
  if (companyReportFields.some(field => Object.prototype.hasOwnProperty.call(data, field))) {
    return this.CompanyReports(data)
  }
  return this.LegacyReports(data)
}

/**
 * @deprecated The legacy /reports/ endpoint was removed in the Python SDK
 * 2.0. Use CompanyReports or Reports with Company Reports credentials instead.
 */
FlittPay.prototype.LegacyReports = function (data) {
  data.date_from = util.dateFormat(data.date_from, '%d.%m.%Y %H:%M:%S', true)
  data.date_to = util.dateFormat(data.date_to, '%d.%m.%Y %H:%M:%S', true)

  const request = this.getImportantParams(data)
  const options = {
    path: 'reports/',
    body: request
  }

  return this._request(options)
}

FlittPay.prototype.CompanyReports = async function (data) {
  const required = ['application_id', 'key', 'report_id']
  required.forEach(field => {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      throw new Error(`${field} is required`)
    }
  })

  const date = new Date().toISOString()
  const token = await this._reportsRequest({
    path: '/authorizer/token/application/get',
    body: {
      application_id: data.application_id,
      date,
      signature: util.genReportsSignature(data.key, data.application_id, date)
    }
  })
  if (!token.token) {
    throw new Error('Company Reports token is missing')
  }

  const body = {
    report_id: data.report_id,
    filters: data.filters || [],
    on_page: data.on_page === undefined ? 10 : data.on_page,
    page: data.page === undefined ? 1 : data.page
  }
  if (data.merchant_id !== undefined) {
    body.merchant_id = data.merchant_id
  }

  return this._reportsRequest({
    path: '/api/extend/company/report/',
    body,
    headers: {
      Authorization: `Token ${token.token}`
    }
  })
}

FlittPay.prototype.PciDssOne = function (data) {
  if (!data.order_id) { data.order_id = this.getOrderId() }

  const request = this.getImportantParams(data)
  const options = {
    path: '3dsecure_step1/',
    body: request
  }

  return this._request(options)
}

FlittPay.prototype.PciDssTwo = function (data) {
  const request = this.getImportantParams(data)
  const options = {
    path: '3dsecure_step2/',
    body: request
  }

  return this._request(options)
}

FlittPay.prototype.Settlement = function (data) {
  this.config.protocol = '2.0'
  const request = this.getImportantParams(data, false)
  const options = {
    path: 'settlement/',
    body: request
  }

  return this._request(options)
}

FlittPay.prototype.Subscription = function (data) {
  this.config.protocol = '2.0'
  this.config.contentType = 'json'
  data.subscription = 'Y'
  const request = this.getImportantParams(data, false)
  const options = {
    path: 'checkout/url/',
    body: request
  }

  return this._request(options)
}

FlittPay.prototype.SubscriptionActions = function (data) {
  if (!data.order_id) { throw new Error('order_id is required') }
  const request = this.getImportantParams(data, false)
  const options = {
    path: 'subscription/',
    body: request
  }

  return this._request(options)
}

function getAdditionalInfo (status) {
  const additionalInfo = status.additional_info || {}
  if (typeof additionalInfo === 'string') {
    return JSON.parse(additionalInfo)
  }
  return additionalInfo
}

function requireFields (data, fields) {
  fields.forEach(field => {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      throw new Error(`${field} is required`)
    }
  })
}

module.exports = FlittPay
