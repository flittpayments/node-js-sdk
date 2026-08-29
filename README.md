# Flitt NODEJS-SDK

<p align="center">
  <img width="200" height="200" src="https://flitt.com/wp-content/uploads/2024/09/Group.svg">
</p>
<p align="center">
	<a href="https://www.npmjs.com/package/@flittpayments/flitt-node-js-sdk"><img src="https://img.shields.io/npm/v/@flittpayments/flitt-node-js-sdk.svg" alt="raiting" /></a>
	<a href="https://www.npmjs.com/package/@flittpayments/flitt-node-js-sdk"><img src="https://img.shields.io/npm/dt/@flittpayments/flitt-node-js-sdk.svg" alt="raiting" /></a>
	<a href="https://www.npmjs.com/package/@flittpayments/flitt-node-js-sdk"><img src="https://img.shields.io/npm/dw/@flittpayments/flitt-node-js-sdk.svg" alt="raiting" /></a>
</p>

## Payment service provider
A payment service provider (PSP) offers shops online services for accepting electronic payments by a variety of payment methods including credit card, bank-based payments such as direct debit, bank transfer, and real-time bank transfer based on online banking. Typically, they use a software as a service model and form a single payment gateway for their clients (merchants) to multiple payment methods. 
[read more](https://en.wikipedia.org/wiki/Payment_service_provider)

## Installation

```cmd
npm install @flittpayments/flitt-node-js-sdk
```

#### Manual installation
```cmd
git clone -b master https://github.com/flittpayments/node-js-sdk.git
```

## Required
```
node >= 7
```
## Simple Start
```javascript
const FlittPay = require('@flittpayments/flitt-node-js-sdk')

const flitt = new FlittPay(
  {
    merchantId: 1549901,
    secretKey: 'test'
  }
)
const requestData = {
  order_id: 'Your Order Id',
  order_desc: 'test order',
  currency: 'GEL',
  amount: '1000'
}
flitt.Checkout(requestData).then(data => {
  console.log(data)
}).catch((error) => {
  console.log(error)
})

```

## API additions from Python SDK 2.0

The Node SDK includes the payment methods added to the Python SDK 2.0 API.

### Open Banking and installments

```javascript
const openBanking = await flitt.OpenBanking({
  currency: 'GEL',
  amount: 10000,
  payment_method: 'tbc'
})

const installments = await flitt.Installments({
  currency: 'GEL',
  amount: 5000,
  payment_method: 'tbc'
})
```

The returned `checkout_url` can be a bank-app deep link. Pass it to the customer unchanged after an explicit user action, and confirm payment using the server callback or `Status`.

### IBAN withdrawal

IBAN withdrawal uses the payout secret configured as `creditKey`.

```javascript
const payout = await flitt.Ibancredit({
  currency: 'GEL',
  amount: 10000,
  receiver_iban: 'GE00TB0000000000000001'
})
```

### Full capture, full reverse, and fiscal data

```javascript
await flitt.CaptureFull({ order_id: 'order-id', currency: 'GEL' })
await flitt.ReverseFull({ order_id: 'order-id', currency: 'GEL' })
const fiscalData = await flitt.FiscalData({ order_id: 'order-id' })
```

`CaptureFull` and `ReverseFull` first request the current order status and calculate the available amount after client fees and prior reversals.

### Company Reports

Company Reports uses separate `application_id` and `key` credentials and the `portal.flitt.com` service. Override the domain with the constructor option `reportsBaseUrl` when needed.

```javascript
const report = await flitt.CompanyReports({
  application_id: 'application-id',
  key: 'reports-key',
  report_id: 745,
  merchant_id: 1549902,
  filters: []
})
```

`Reports` accepts the same Company Reports data as a compatibility alias. Calls using the old `date_from`/`date_to` shape still reach the legacy endpoint, but that usage is deprecated.

### Deprecated methods

- `TransactionList` is kept for backward compatibility but was removed from the Python SDK 2.0 API. Use `Status` for current order state.
- `LegacyReports` and date-range calls to `Reports` use the legacy `/reports/` endpoint. They are kept for backward compatibility; use `CompanyReports` or `Reports` with Company Reports credentials.

### Notice

```merchant_data``` must be string. 

Example:
```
 const merchant_data = JSON.stringify([{
    email: 'test@flitt.eu',
    comment: 'Some comment'
 }])
```
# Api

See [docs](https://docs.flitt.com/)

## Examples

See all [SDK examples](https://github.com/flittpayments/node-js-sdk/tree/master/examples), including:

- [Open Banking](examples/open_banking.js)
- [Installments](examples/installments.js)
- [IBAN withdrawal](examples/ibancredit.js)
- [Full capture](examples/capture_full.js) and [full reverse](examples/reverse_full.js)
- [Fiscal data](examples/fiscal_data.js)
- [Company Reports](examples/reports.js)
