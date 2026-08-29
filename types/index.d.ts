export interface FlittPayOptions {
    protocol?: string;
    merchantId: number;
    baseUrl?: string;
    reportsBaseUrl?: string;
    secretKey: string;
    creditKey?: string;
    contentType?: string;
    timeout?: number;
  }

  export default class FlittPay {
    constructor(options: FlittPayOptions);

    getImportantParams(data: any): any;
    getOrderId(): string;
    isValidResponse(data: any, credit?: boolean): boolean;
    Checkout(data: any): Promise<any>;
    CheckoutToken(data: any): Promise<any>;
    OpenBanking(data: OpenBankingData): Promise<CheckoutResponse>;
    Installments(data: InstallmentsData): Promise<CheckoutResponse>;
    Verification(data: any): Promise<any>;
    Capture(data: any): Promise<any>;
    CaptureFull(data: FullOrderOperationData): Promise<any>;
    Recurring(data: any): Promise<any>;
    Reverse(data: any): Promise<any>;
    ReverseFull(data: FullOrderOperationData): Promise<any>;
    Status(data: any): Promise<any>;
    FiscalData(data: FiscalDataRequest): Promise<FiscalDataResponse>;
    P2pcredit(data: any): Promise<any>;
    Ibancredit(data: IbanCreditData): Promise<any>;
    /** @deprecated Removed from the Python SDK in 2.0. Use Status instead. */
    TransactionList(data: any): Promise<any>;
    Reports(data: CompanyReportsData): Promise<CompanyReportsResponse>;
    /** @deprecated Legacy date-range usage was removed from the Python SDK in 2.0. Use CompanyReports instead. */
    Reports(data: LegacyReportsData): Promise<any>;
    /** @deprecated The legacy reports endpoint was removed from the Python SDK in 2.0. Use CompanyReports instead. */
    LegacyReports(data: LegacyReportsData): Promise<any>;
    CompanyReports(data: CompanyReportsData): Promise<CompanyReportsResponse>;
    PciDssOne(data: any): Promise<any>;
    PciDssTwo(data: any): Promise<any>;
    Settlement(data: any): Promise<any>;
    Subscription(data: any): Promise<any>;
    SubscriptionActions(data: any): Promise<any>;
  }

  export interface CheckoutData {
    order_id?: string;
    order_desc?: string;
    currency: string;
    amount: number | string;
    response_url?: string;
    server_callback_url?: string;
    lang?: string;
    product_id?: number;
    recurring_data?: RecurringData;
    verification?: boolean;
  }

  export interface RecurringData {
    recurring_lifetime: string;
    recurring_frequency: string;
  }

  export interface CheckoutResponse {
    checkout_url: string;
    payment_id: string;
  }

  export interface OpenBankingData extends CheckoutData {
    payment_method?: 'tbc' | 'bog' | 'liberty' | 'credo' | 'x';
  }

  export interface InstallmentsData extends CheckoutData {
    payment_method?: 'tbc' | 'x';
  }

  export interface FullOrderOperationData {
    order_id: string;
    currency: string;
    [key: string]: any;
  }

  export interface FiscalDataRequest {
    order_id: string;
    [key: string]: any;
  }

  export interface FiscalDataResponse {
    fiscalisation_data?: {
      [taxId: string]: any;
    };
    [key: string]: any;
  }

  export interface IbanCreditData {
    receiver_iban: string;
    currency: string;
    amount: number | string;
    order_id?: string;
    order_desc?: string;
    [key: string]: any;
  }

  export interface CompanyReportFilter {
    s: string;
    m: string;
    v: any;
  }

  export interface CompanyReportsData {
    application_id: string | number;
    key: string;
    report_id: string | number;
    merchant_id?: string | number;
    filters?: CompanyReportFilter[];
    on_page?: number;
    page?: number;
  }

  export interface CompanyReportsResponse {
    data?: any[][];
    fields?: any[];
    rows_count?: number;
    rows_on_page?: number;
    rows_page?: number;
    error?: any;
    err_code?: any;
    [key: string]: any;
  }

  export interface LegacyReportsData {
    date_from: Date;
    date_to: Date;
  }

  export interface CallbackData {
    signature: string;
    data: string;
  }

  export interface CallbackResponse {
    [key: string]: any;
  }

  export interface ReverseData {
    order_id: string;
    amount?: number;
  }

  export interface ReverseResponse {
    [key: string]: any;
  }

  export interface CaptureData {
    order_id: string;
    amount: number;
  }

  export interface CaptureResponse {
    [key: string]: any;
  }

  export interface RefundData {
    order_id: string;
    amount: number;
    comment?: string;
  }

  export interface RefundResponse {
    [key: string]: any;
  }
