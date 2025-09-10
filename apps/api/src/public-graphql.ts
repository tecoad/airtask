
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum QuotationAvailabilityErrorCode {
    QUOTATION_WITHOUT_ACTIVE_SUBSCRIPTION = "QUOTATION_WITHOUT_ACTIVE_SUBSCRIPTION",
    QUOTATION_NOT_FOUND = "QUOTATION_NOT_FOUND"
}

export enum CurrencyCode {
    AED = "AED",
    AFN = "AFN",
    ALL = "ALL",
    AMD = "AMD",
    ANG = "ANG",
    AOA = "AOA",
    ARS = "ARS",
    AUD = "AUD",
    AWG = "AWG",
    AZN = "AZN",
    BAM = "BAM",
    BBD = "BBD",
    BDT = "BDT",
    BGN = "BGN",
    BHD = "BHD",
    BIF = "BIF",
    BMD = "BMD",
    BND = "BND",
    BOB = "BOB",
    BRL = "BRL",
    BSD = "BSD",
    BTN = "BTN",
    BWP = "BWP",
    BYN = "BYN",
    BZD = "BZD",
    CAD = "CAD",
    CDF = "CDF",
    CHF = "CHF",
    CLP = "CLP",
    CNY = "CNY",
    COP = "COP",
    CRC = "CRC",
    CUC = "CUC",
    CUP = "CUP",
    CVE = "CVE",
    CZK = "CZK",
    DJF = "DJF",
    DKK = "DKK",
    DOP = "DOP",
    DZD = "DZD",
    EGP = "EGP",
    ERN = "ERN",
    ETB = "ETB",
    EUR = "EUR",
    FJD = "FJD",
    FKP = "FKP",
    GBP = "GBP",
    GEL = "GEL",
    GHS = "GHS",
    GIP = "GIP",
    GMD = "GMD",
    GNF = "GNF",
    GTQ = "GTQ",
    GYD = "GYD",
    HKD = "HKD",
    HNL = "HNL",
    HRK = "HRK",
    HTG = "HTG",
    HUF = "HUF",
    IDR = "IDR",
    ILS = "ILS",
    INR = "INR",
    IQD = "IQD",
    IRR = "IRR",
    ISK = "ISK",
    JMD = "JMD",
    JOD = "JOD",
    JPY = "JPY",
    KES = "KES",
    KGS = "KGS",
    KHR = "KHR",
    KMF = "KMF",
    KPW = "KPW",
    KRW = "KRW",
    KWD = "KWD",
    KYD = "KYD",
    KZT = "KZT",
    LAK = "LAK",
    LBP = "LBP",
    LKR = "LKR",
    LRD = "LRD",
    LSL = "LSL",
    LYD = "LYD",
    MAD = "MAD",
    MDL = "MDL",
    MGA = "MGA",
    MKD = "MKD",
    MMK = "MMK",
    MNT = "MNT",
    MOP = "MOP",
    MRU = "MRU",
    MUR = "MUR",
    MVR = "MVR",
    MWK = "MWK",
    MXN = "MXN",
    MYR = "MYR",
    MZN = "MZN",
    NAD = "NAD",
    NGN = "NGN",
    NIO = "NIO",
    NOK = "NOK",
    NPR = "NPR",
    NZD = "NZD",
    OMR = "OMR",
    PAB = "PAB",
    PEN = "PEN",
    PGK = "PGK",
    PHP = "PHP",
    PKR = "PKR",
    PLN = "PLN",
    PYG = "PYG",
    QAR = "QAR",
    RON = "RON",
    RSD = "RSD",
    RUB = "RUB",
    RWF = "RWF",
    SAR = "SAR",
    SBD = "SBD",
    SCR = "SCR",
    SDG = "SDG",
    SEK = "SEK",
    SGD = "SGD",
    SHP = "SHP",
    SLL = "SLL",
    SOS = "SOS",
    SRD = "SRD",
    SSP = "SSP",
    STN = "STN",
    SVC = "SVC",
    SYP = "SYP",
    SZL = "SZL",
    THB = "THB",
    TJS = "TJS",
    TMT = "TMT",
    TND = "TND",
    TOP = "TOP",
    TRY = "TRY",
    TTD = "TTD",
    TWD = "TWD",
    TZS = "TZS",
    UAH = "UAH",
    UGX = "UGX",
    USD = "USD",
    UYU = "UYU",
    UZS = "UZS",
    VES = "VES",
    VND = "VND",
    VUV = "VUV",
    WST = "WST",
    XAF = "XAF",
    XCD = "XCD",
    XOF = "XOF",
    XPF = "XPF",
    YER = "YER",
    ZAR = "ZAR",
    ZMW = "ZMW",
    ZWL = "ZWL"
}

export enum LanguageCode {
    pt = "pt",
    en = "en"
}

export enum SortOrder {
    asc = "asc",
    desc = "desc"
}

export enum FilterOperator {
    and = "and",
    or = "or"
}

export enum Permissions {
    SuperAdmin = "SuperAdmin",
    ListUsers = "ListUsers"
}

export enum QuotationMessageRole {
    agent = "agent",
    customer = "customer"
}

export enum QuotationConversationStatus {
    active = "active",
    finished = "finished"
}

export enum WidgetTheme {
    dark = "dark",
    light = "light",
    both = "both"
}

export interface SendQuotationConversationMessageInput {
    conversationId: string;
    message: string;
}

export interface NumberFilter {
    equals?: Nullable<number>;
    not?: Nullable<number>;
    in?: Nullable<Nullable<number>[]>;
    notIn?: Nullable<Nullable<number>[]>;
    lt?: Nullable<number>;
    lte?: Nullable<number>;
    gt?: Nullable<number>;
    gte?: Nullable<number>;
}

export interface DateTimeFilter {
    equals?: Nullable<DateTime>;
    not?: Nullable<DateTime>;
    in?: Nullable<Nullable<DateTime>[]>;
    notIn?: Nullable<Nullable<DateTime>[]>;
    lt?: Nullable<DateTime>;
    lte?: Nullable<DateTime>;
    gt?: Nullable<DateTime>;
    gte?: Nullable<DateTime>;
}

export interface QuotationConversationRecipientInput {
    first_name: string;
    last_name: string;
    email: string;
    phone?: Nullable<string>;
}

export interface ISubscription {
    initQuotationConversation(hash: string, recipient?: Nullable<QuotationConversationRecipientInput>): Nullable<InitQuotationConversationResult> | Promise<Nullable<InitQuotationConversationResult>>;
    sendQuotationConversationMessage(input: SendQuotationConversationMessageInput): Nullable<QuotationConversationMessageResult> | Promise<Nullable<QuotationConversationMessageResult>>;
}

export interface QuotationAvailabilityError {
    errorCode: QuotationAvailabilityErrorCode;
    message: string;
}

export interface IQuery {
    publicQuotation(hash?: Nullable<string>, id?: Nullable<string>): Nullable<PublicQuotationResult> | Promise<Nullable<PublicQuotationResult>>;
    findPublicWithoutAvailabilityCheck(hash?: Nullable<string>, id?: Nullable<string>): Nullable<PublicQuotation> | Promise<Nullable<PublicQuotation>>;
    quotationConversation(id: string): Nullable<QuotationConversationResult> | Promise<Nullable<QuotationConversationResult>>;
    quotationWidgetSettings(hash?: Nullable<string>, id?: Nullable<string>): Nullable<WidgetConfig> | Promise<Nullable<WidgetConfig>>;
}

export interface QuotationConversationMessageToken {
    token: string;
}

export interface IMutation {
    updateQuotationConversationRecipient(quotationConversationId: string, recipient?: Nullable<QuotationConversationRecipientInput>): QuotationConversationRecipient | Promise<QuotationConversationRecipient>;
    uploadFile(file: Upload): Asset[] | Promise<Asset[]>;
}

export interface Translation {
    language: LanguageCode;
    value: string;
}

export interface PublicQuotation {
    hash: string;
    title: string;
    widget_config?: Nullable<WidgetConfig>;
}

export interface QuotationConversationRecipient {
    first_name?: Nullable<string>;
    last_name?: Nullable<string>;
    email?: Nullable<string>;
    phone?: Nullable<string>;
}

export interface QuotationConversationMessage {
    sent_at: DateTime;
    content: string;
    role: QuotationMessageRole;
    is_ending_message?: Nullable<boolean>;
}

export interface QuotationConversation {
    id: string;
    status: QuotationConversationStatus;
    message: QuotationConversationMessage[];
    recipient?: Nullable<QuotationConversationRecipient>;
    quotation?: Nullable<PublicQuotation>;
}

export interface Asset {
    id: string;
    title: string;
    url: string;
    width?: Nullable<number>;
    height?: Nullable<number>;
    type: string;
    filesize: string;
    duration?: Nullable<number>;
}

export interface WidgetConfig {
    title?: Nullable<string>;
    main_color?: Nullable<string>;
    position?: Nullable<string>;
    google_font?: Nullable<string>;
    font_size?: Nullable<number>;
    width?: Nullable<string>;
    height?: Nullable<string>;
    hide_powered_by?: Nullable<boolean>;
    initially_open?: Nullable<boolean>;
    allowed_domains?: Nullable<string[]>;
    theme?: Nullable<WidgetTheme>;
    button_text?: Nullable<string>;
    button_text_color?: Nullable<string>;
    distance_from_border?: Nullable<number>;
    button_size?: Nullable<number>;
    button_color?: Nullable<string>;
    button_font_size?: Nullable<string>;
    button_icon_color?: Nullable<string>;
    icon?: Nullable<Asset>;
    avatar?: Nullable<Asset>;
}

export type File = any;
export type DateTime = any;
export type JSON = any;
export type Upload = any;
export type InitQuotationConversationResult = QuotationConversation | QuotationAvailabilityError | QuotationConversationMessage | QuotationConversationMessageToken;
export type PublicQuotationResult = PublicQuotation | QuotationAvailabilityError;
export type QuotationConversationResult = QuotationConversation | QuotationAvailabilityError;
export type QuotationConversationMessageResult = QuotationConversationMessage | QuotationConversationMessageToken;
type Nullable<T> = T | null;
