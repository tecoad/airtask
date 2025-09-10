export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  File: any;
  JSON: any;
  Upload: any;
};

export type Account = {
  __typename?: 'Account';
  active_subscription?: Maybe<AccountSubscription>;
  concluded_onboarding_steps: Array<OnBoardingStep>;
  currency?: Maybe<CurrencyCode>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  segment?: Maybe<Segment>;
  users: Array<UserAccount>;
  website?: Maybe<Scalars['String']>;
};

export type AccountApiKey = {
  __typename?: 'AccountApiKey';
  date_created: Scalars['DateTime'];
  date_updated?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  maskedToken: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  /** Complete API key. Only will be returned when creating a new key. */
  token?: Maybe<Scalars['String']>;
};

export enum AccountRole {
  Owner = 'owner',
  User = 'user'
}

export type AccountSubscription = {
  __typename?: 'AccountSubscription';
  id: Scalars['ID'];
  status: SubscriptionStatus;
};

export type AccountSubscriptionData = {
  __typename?: 'AccountSubscriptionData';
  credits: Scalars['Float'];
  period_end: Scalars['DateTime'];
  period_start: Scalars['DateTime'];
  plan: Scalars['String'];
  plan_interval: PlanInterval;
};

export enum AccountUsageKind {
  Flow = 'flow',
  Quotation = 'quotation'
}

export type ActiveUser = {
  __typename?: 'ActiveUser';
  accounts: Array<UserAccount>;
  anonymous_id?: Maybe<Scalars['String']>;
  email: Scalars['String'];
  first_name: Scalars['String'];
  id: Scalars['ID'];
  is_affiliate?: Maybe<Scalars['Boolean']>;
  language?: Maybe<LanguageCode>;
  last_login?: Maybe<Scalars['DateTime']>;
  last_name: Scalars['String'];
  permissions: Array<Permissions>;
};

export type Affiliate = {
  __typename?: 'Affiliate';
  alias: Scalars['String'];
  comission_duration_months?: Maybe<Scalars['Int']>;
  comission_percentage?: Maybe<Scalars['Int']>;
  date_created: Scalars['DateTime'];
  date_updated?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  payout_method?: Maybe<AffiliatePayoutMethod>;
  payout_method_key?: Maybe<Scalars['String']>;
  status: AffiliateStatus;
};

export type AffiliateComission = {
  __typename?: 'AffiliateComission';
  amount: Scalars['Float'];
  date_created: Scalars['DateTime'];
  date_payment?: Maybe<Scalars['DateTime']>;
  id: Scalars['String'];
  status: AffiliateComissionStatus;
};

export type AffiliateComissionListSort = {
  amount?: InputMaybe<SortOrder>;
  date_created?: InputMaybe<SortOrder>;
};

export enum AffiliateComissionStatus {
  Paid = 'paid',
  Pending = 'pending'
}

export type AffiliateComissionsCalcs = {
  __typename?: 'AffiliateComissionsCalcs';
  amountOfUsersIndicated: Scalars['Int'];
  nextPaymentDate: Scalars['DateTime'];
  paidAmountByPeriod: Scalars['Float'];
  pendingAmountToReceive: Scalars['Float'];
};


export type AffiliateComissionsCalcsPaidAmountByPeriodArgs = {
  from?: InputMaybe<Scalars['DateTime']>;
  to?: InputMaybe<Scalars['DateTime']>;
};

export type AffiliateComissionsListFilter = {
  operator: FilterOperator;
  status?: InputMaybe<AffiliateComissionStatus>;
};

export enum AffiliatePayoutMethod {
  Paypal = 'paypal',
  Pix = 'pix'
}

export type AffiliateSettingsResult = Affiliate | AffiliateSettingsResultError;

export type AffiliateSettingsResultError = {
  __typename?: 'AffiliateSettingsResultError';
  errorCode: AffiliateSettingsResultErrorCode;
  message: Scalars['String'];
};

export enum AffiliateSettingsResultErrorCode {
  InvalidPassword = 'INVALID_PASSWORD'
}

export enum AffiliateStatus {
  Active = 'active',
  Inactive = 'inactive',
  WaitingApproval = 'waiting_approval'
}

export type Asset = {
  __typename?: 'Asset';
  duration?: Maybe<Scalars['Int']>;
  filesize: Scalars['String'];
  height?: Maybe<Scalars['Int']>;
  id: Scalars['ID'];
  title: Scalars['String'];
  type: Scalars['String'];
  url: Scalars['String'];
  width?: Maybe<Scalars['Int']>;
};

export type BatchUpdateFlowContact = {
  id: Scalars['ID'];
  status?: InputMaybe<FlowContactStatus>;
};

export type CreateAccountApiKeyInput = {
  accountId: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
};

export type CreateDebugInteractionInput = {
  agentId: Scalars['ID'];
  debugAsInbound: Scalars['Boolean'];
  phoneNumber: Scalars['String'];
  prospectName: Scalars['String'];
};

export type CreateDebugInteractionResult = DebugInteractionCreated | DebugInteractionError;

export type CreateExtraCreditCheckoutInput = {
  accountId: Scalars['ID'];
  priceExternalId: Scalars['String'];
};

export type CreateExtraCreditCheckoutResult = {
  __typename?: 'CreateExtraCreditCheckoutResult';
  url: Scalars['String'];
};

export type CreateFlowAgentInput = {
  account: Scalars['ID'];
  editor_type: FlowAgentEditorType;
  knowledge_base?: InputMaybe<Scalars['ID']>;
  script?: InputMaybe<Scalars['String']>;
  script_language?: InputMaybe<Scalars['String']>;
  script_schema?: InputMaybe<Scalars['JSON']>;
  title: Scalars['String'];
  voice: FlowAgentVoice;
};

export type CreateFlowContactSegmentInput = {
  account: Scalars['ID'];
  label: Scalars['String'];
};

export type CreateFlowInput = {
  account: Scalars['ID'];
  agent: Scalars['ID'];
  daily_budget: Scalars['Float'];
  name: Scalars['String'];
  segment?: InputMaybe<Scalars['ID']>;
  status: FlowStatus;
  type: FlowType;
};

export type CreateKnowledgeBaseInput = {
  title: Scalars['String'];
  type: KnowledgeBaseType;
};

export type CreateKnowledgeBaseQaInput = {
  answer: Scalars['String'];
  knowledge_base_id: Array<Scalars['ID']>;
  question: Scalars['String'];
};

export type CreateQuotationInput = {
  account: Scalars['ID'];
  prompt_instructions?: InputMaybe<Scalars['String']>;
  status: QuotationStatus;
  title: Scalars['String'];
};

export type CreateQuotationQuestionChildrenInput = {
  children?: InputMaybe<Array<CreateQuotationQuestionChildrenInput>>;
  condition: Scalars['String'];
  label: Scalars['String'];
  order: Scalars['Int'];
};

export type CreateQuotationQuestionInput = {
  active: Scalars['Boolean'];
  children?: InputMaybe<Array<CreateQuotationQuestionChildrenInput>>;
  condition?: InputMaybe<Scalars['String']>;
  label: Scalars['String'];
  order: Scalars['Int'];
  parent?: InputMaybe<Scalars['ID']>;
  quotation: Scalars['ID'];
};

export type CreateSubscriptionCheckoutInput = {
  accountId: Scalars['ID'];
  priceExternalId: Scalars['String'];
};

export type CreateSubscriptionCheckoutResult = {
  __typename?: 'CreateSubscriptionCheckoutResult';
  url: Scalars['String'];
};

export type CreateUserAffiliateInput = {
  alias: Scalars['String'];
  password: Scalars['String'];
  payout_method: AffiliatePayoutMethod;
  payout_method_key: Scalars['String'];
};

export type CreditTransaction = {
  __typename?: 'CreditTransaction';
  creditId: Scalars['ID'];
  reason?: Maybe<CreditTransactionReason>;
};

export enum CreditTransactionReason {
  CreditBuy = 'credit_buy',
  ModuleUsage = 'module_usage',
  PlanCancellation = 'plan_cancellation',
  PlanChange = 'plan_change',
  PlanCreation = 'plan_creation',
  PlanRenewal = 'plan_renewal'
}

export enum CreditTransactionType {
  Credit = 'credit',
  Debit = 'debit'
}

/**
 * @description
 * ISO 4217 currency code
 */
export enum CurrencyCode {
  /** United Arab Emirates dirham */
  Aed = 'AED',
  /** Afghan afghani */
  Afn = 'AFN',
  /** Albanian lek */
  All = 'ALL',
  /** Armenian dram */
  Amd = 'AMD',
  /** Netherlands Antillean guilder */
  Ang = 'ANG',
  /** Angolan kwanza */
  Aoa = 'AOA',
  /** Argentine peso */
  Ars = 'ARS',
  /** Australian dollar */
  Aud = 'AUD',
  /** Aruban florin */
  Awg = 'AWG',
  /** Azerbaijani manat */
  Azn = 'AZN',
  /** Bosnia and Herzegovina convertible mark */
  Bam = 'BAM',
  /** Barbados dollar */
  Bbd = 'BBD',
  /** Bangladeshi taka */
  Bdt = 'BDT',
  /** Bulgarian lev */
  Bgn = 'BGN',
  /** Bahraini dinar */
  Bhd = 'BHD',
  /** Burundian franc */
  Bif = 'BIF',
  /** Bermudian dollar */
  Bmd = 'BMD',
  /** Brunei dollar */
  Bnd = 'BND',
  /** Boliviano */
  Bob = 'BOB',
  /** Brazilian real */
  Brl = 'BRL',
  /** Bahamian dollar */
  Bsd = 'BSD',
  /** Bhutanese ngultrum */
  Btn = 'BTN',
  /** Botswana pula */
  Bwp = 'BWP',
  /** Belarusian ruble */
  Byn = 'BYN',
  /** Belize dollar */
  Bzd = 'BZD',
  /** Canadian dollar */
  Cad = 'CAD',
  /** Congolese franc */
  Cdf = 'CDF',
  /** Swiss franc */
  Chf = 'CHF',
  /** Chilean peso */
  Clp = 'CLP',
  /** Renminbi (Chinese) yuan */
  Cny = 'CNY',
  /** Colombian peso */
  Cop = 'COP',
  /** Costa Rican colon */
  Crc = 'CRC',
  /** Cuban convertible peso */
  Cuc = 'CUC',
  /** Cuban peso */
  Cup = 'CUP',
  /** Cape Verde escudo */
  Cve = 'CVE',
  /** Czech koruna */
  Czk = 'CZK',
  /** Djiboutian franc */
  Djf = 'DJF',
  /** Danish krone */
  Dkk = 'DKK',
  /** Dominican peso */
  Dop = 'DOP',
  /** Algerian dinar */
  Dzd = 'DZD',
  /** Egyptian pound */
  Egp = 'EGP',
  /** Eritrean nakfa */
  Ern = 'ERN',
  /** Ethiopian birr */
  Etb = 'ETB',
  /** Euro */
  Eur = 'EUR',
  /** Fiji dollar */
  Fjd = 'FJD',
  /** Falkland Islands pound */
  Fkp = 'FKP',
  /** Pound sterling */
  Gbp = 'GBP',
  /** Georgian lari */
  Gel = 'GEL',
  /** Ghanaian cedi */
  Ghs = 'GHS',
  /** Gibraltar pound */
  Gip = 'GIP',
  /** Gambian dalasi */
  Gmd = 'GMD',
  /** Guinean franc */
  Gnf = 'GNF',
  /** Guatemalan quetzal */
  Gtq = 'GTQ',
  /** Guyanese dollar */
  Gyd = 'GYD',
  /** Hong Kong dollar */
  Hkd = 'HKD',
  /** Honduran lempira */
  Hnl = 'HNL',
  /** Croatian kuna */
  Hrk = 'HRK',
  /** Haitian gourde */
  Htg = 'HTG',
  /** Hungarian forint */
  Huf = 'HUF',
  /** Indonesian rupiah */
  Idr = 'IDR',
  /** Israeli new shekel */
  Ils = 'ILS',
  /** Indian rupee */
  Inr = 'INR',
  /** Iraqi dinar */
  Iqd = 'IQD',
  /** Iranian rial */
  Irr = 'IRR',
  /** Icelandic króna */
  Isk = 'ISK',
  /** Jamaican dollar */
  Jmd = 'JMD',
  /** Jordanian dinar */
  Jod = 'JOD',
  /** Japanese yen */
  Jpy = 'JPY',
  /** Kenyan shilling */
  Kes = 'KES',
  /** Kyrgyzstani som */
  Kgs = 'KGS',
  /** Cambodian riel */
  Khr = 'KHR',
  /** Comoro franc */
  Kmf = 'KMF',
  /** North Korean won */
  Kpw = 'KPW',
  /** South Korean won */
  Krw = 'KRW',
  /** Kuwaiti dinar */
  Kwd = 'KWD',
  /** Cayman Islands dollar */
  Kyd = 'KYD',
  /** Kazakhstani tenge */
  Kzt = 'KZT',
  /** Lao kip */
  Lak = 'LAK',
  /** Lebanese pound */
  Lbp = 'LBP',
  /** Sri Lankan rupee */
  Lkr = 'LKR',
  /** Liberian dollar */
  Lrd = 'LRD',
  /** Lesotho loti */
  Lsl = 'LSL',
  /** Libyan dinar */
  Lyd = 'LYD',
  /** Moroccan dirham */
  Mad = 'MAD',
  /** Moldovan leu */
  Mdl = 'MDL',
  /** Malagasy ariary */
  Mga = 'MGA',
  /** Macedonian denar */
  Mkd = 'MKD',
  /** Myanmar kyat */
  Mmk = 'MMK',
  /** Mongolian tögrög */
  Mnt = 'MNT',
  /** Macanese pataca */
  Mop = 'MOP',
  /** Mauritanian ouguiya */
  Mru = 'MRU',
  /** Mauritian rupee */
  Mur = 'MUR',
  /** Maldivian rufiyaa */
  Mvr = 'MVR',
  /** Malawian kwacha */
  Mwk = 'MWK',
  /** Mexican peso */
  Mxn = 'MXN',
  /** Malaysian ringgit */
  Myr = 'MYR',
  /** Mozambican metical */
  Mzn = 'MZN',
  /** Namibian dollar */
  Nad = 'NAD',
  /** Nigerian naira */
  Ngn = 'NGN',
  /** Nicaraguan córdoba */
  Nio = 'NIO',
  /** Norwegian krone */
  Nok = 'NOK',
  /** Nepalese rupee */
  Npr = 'NPR',
  /** New Zealand dollar */
  Nzd = 'NZD',
  /** Omani rial */
  Omr = 'OMR',
  /** Panamanian balboa */
  Pab = 'PAB',
  /** Peruvian sol */
  Pen = 'PEN',
  /** Papua New Guinean kina */
  Pgk = 'PGK',
  /** Philippine peso */
  Php = 'PHP',
  /** Pakistani rupee */
  Pkr = 'PKR',
  /** Polish złoty */
  Pln = 'PLN',
  /** Paraguayan guaraní */
  Pyg = 'PYG',
  /** Qatari riyal */
  Qar = 'QAR',
  /** Romanian leu */
  Ron = 'RON',
  /** Serbian dinar */
  Rsd = 'RSD',
  /** Russian ruble */
  Rub = 'RUB',
  /** Rwandan franc */
  Rwf = 'RWF',
  /** Saudi riyal */
  Sar = 'SAR',
  /** Solomon Islands dollar */
  Sbd = 'SBD',
  /** Seychelles rupee */
  Scr = 'SCR',
  /** Sudanese pound */
  Sdg = 'SDG',
  /** Swedish krona/kronor */
  Sek = 'SEK',
  /** Singapore dollar */
  Sgd = 'SGD',
  /** Saint Helena pound */
  Shp = 'SHP',
  /** Sierra Leonean leone */
  Sll = 'SLL',
  /** Somali shilling */
  Sos = 'SOS',
  /** Surinamese dollar */
  Srd = 'SRD',
  /** South Sudanese pound */
  Ssp = 'SSP',
  /** São Tomé and Príncipe dobra */
  Stn = 'STN',
  /** Salvadoran colón */
  Svc = 'SVC',
  /** Syrian pound */
  Syp = 'SYP',
  /** Swazi lilangeni */
  Szl = 'SZL',
  /** Thai baht */
  Thb = 'THB',
  /** Tajikistani somoni */
  Tjs = 'TJS',
  /** Turkmenistan manat */
  Tmt = 'TMT',
  /** Tunisian dinar */
  Tnd = 'TND',
  /** Tongan paʻanga */
  Top = 'TOP',
  /** Turkish lira */
  Try = 'TRY',
  /** Trinidad and Tobago dollar */
  Ttd = 'TTD',
  /** New Taiwan dollar */
  Twd = 'TWD',
  /** Tanzanian shilling */
  Tzs = 'TZS',
  /** Ukrainian hryvnia */
  Uah = 'UAH',
  /** Ugandan shilling */
  Ugx = 'UGX',
  /** United States dollar */
  Usd = 'USD',
  /** Uruguayan peso */
  Uyu = 'UYU',
  /** Uzbekistan som */
  Uzs = 'UZS',
  /** Venezuelan bolívar soberano */
  Ves = 'VES',
  /** Vietnamese đồng */
  Vnd = 'VND',
  /** Vanuatu vatu */
  Vuv = 'VUV',
  /** Samoan tala */
  Wst = 'WST',
  /** CFA franc BEAC */
  Xaf = 'XAF',
  /** East Caribbean dollar */
  Xcd = 'XCD',
  /** CFA franc BCEAO */
  Xof = 'XOF',
  /** CFP franc (franc Pacifique) */
  Xpf = 'XPF',
  /** Yemeni rial */
  Yer = 'YER',
  /** South African rand */
  Zar = 'ZAR',
  /** Zambian kwacha */
  Zmw = 'ZMW',
  /** Zimbabwean dollar */
  Zwl = 'ZWL'
}

export type DateTimeFilter = {
  equals?: InputMaybe<Scalars['DateTime']>;
  gt?: InputMaybe<Scalars['DateTime']>;
  gte?: InputMaybe<Scalars['DateTime']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['DateTime']>>>;
  lt?: InputMaybe<Scalars['DateTime']>;
  lte?: InputMaybe<Scalars['DateTime']>;
  not?: InputMaybe<Scalars['DateTime']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['DateTime']>>>;
};

export type DebugInteractionCreated = {
  __typename?: 'DebugInteractionCreated';
  interactionId: Scalars['String'];
};

export type DebugInteractionError = {
  __typename?: 'DebugInteractionError';
  errorCode: DebugInteractionErrorCode;
  message: Scalars['String'];
};

export enum DebugInteractionErrorCode {
  InsufficientFunds = 'INSUFFICIENT_FUNDS'
}

export enum FilterOperator {
  And = 'and',
  Or = 'or'
}

export type Flow = {
  __typename?: 'Flow';
  agent: FlowAgent;
  daily_budget: Scalars['Float'];
  date_created: Scalars['DateTime'];
  date_updated?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  segment?: Maybe<FlowContactSegment>;
  status: FlowStatus;
  type: FlowType;
};

export type FlowAgent = {
  __typename?: 'FlowAgent';
  date_created: Scalars['DateTime'];
  date_updated?: Maybe<Scalars['DateTime']>;
  editor_type: FlowAgentEditorType;
  id: Scalars['ID'];
  knowledge_base?: Maybe<KnowledgeBase>;
  script?: Maybe<Scalars['String']>;
  script_language?: Maybe<Scalars['String']>;
  script_schema?: Maybe<Scalars['JSON']>;
  title: Scalars['String'];
  voice: FlowAgentVoice;
};

export enum FlowAgentEditorType {
  Advanced = 'advanced',
  Form = 'form',
  Standard = 'standard'
}

export enum FlowAgentVoice {
  Female = 'female',
  Male = 'male'
}

export type FlowContact = {
  __typename?: 'FlowContact';
  date_created: Scalars['DateTime'];
  date_updated?: Maybe<Scalars['DateTime']>;
  email?: Maybe<Scalars['String']>;
  first_name: Scalars['String'];
  id: Scalars['ID'];
  last_name: Scalars['String'];
  phone: Scalars['String'];
  segments: Array<FlowContactSegment>;
  status: FlowContactStatus;
};

export type FlowContactListFilter = {
  operator: FilterOperator;
  /** email, phone, first_name or last_name */
  search?: InputMaybe<Scalars['String']>;
  segment?: InputMaybe<Scalars['ID']>;
  status?: InputMaybe<FlowContactStatus>;
};

export type FlowContactListSort = {
  date_created?: InputMaybe<SortOrder>;
};

export type FlowContactSegment = {
  __typename?: 'FlowContactSegment';
  date_created: Scalars['DateTime'];
  date_updated?: Maybe<Scalars['DateTime']>;
  flow_contacts_count: Scalars['Int'];
  flow_instances_count: Scalars['Int'];
  id: Scalars['ID'];
  label: Scalars['String'];
};

export enum FlowContactStatus {
  Active = 'active',
  Inactive = 'inactive'
}

export type FlowRecording = {
  __typename?: 'FlowRecording';
  contact_name: Scalars['String'];
  contact_phone: Scalars['String'];
  date_created: Scalars['DateTime'];
  duration: Scalars['Int'];
  flow?: Maybe<Flow>;
  id: Scalars['ID'];
  record: Asset;
};

export type FlowRecordingListFilter = {
  contact_search?: InputMaybe<Scalars['String']>;
  date_created?: InputMaybe<DateTimeFilter>;
  duration?: InputMaybe<NumberFilter>;
  flow?: InputMaybe<Scalars['ID']>;
  operator: FilterOperator;
};

export type FlowRecordingListSort = {
  date_created?: InputMaybe<SortOrder>;
};

export enum FlowStatus {
  Active = 'active',
  Paused = 'paused',
  Stopped = 'stopped'
}

export enum FlowType {
  Inbound = 'inbound',
  Outbound = 'outbound'
}

export type ImportFlowContactsError = {
  __typename?: 'ImportFlowContactsError';
  errorCode: ImportFlowContactsErrorCode;
  message: Scalars['String'];
};

export enum ImportFlowContactsErrorCode {
  /** On this error, the message will be a list of columns missing, separated by comma */
  InvalidCsvColumnsStructure = 'INVALID_CSV_COLUMNS_STRUCTURE',
  InvalidFileFormat = 'INVALID_FILE_FORMAT',
  NoItemsFound = 'NO_ITEMS_FOUND'
}

export type ImportFlowContactsFromCsvInput = {
  account: Scalars['ID'];
  segment: Scalars['ID'];
};

export type ImportFlowContactsFromCsvResult = ImportFlowContactsError | ImportFlowContactsQueued;

export type ImportFlowContactsQueued = {
  __typename?: 'ImportFlowContactsQueued';
  import_id: Scalars['ID'];
  queued_items: Scalars['Int'];
};

export type KnowledgeBase = {
  __typename?: 'KnowledgeBase';
  date_created: Scalars['DateTime'];
  date_updated?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  qa: Array<KnowledgeBaseQa>;
  title: Scalars['String'];
  type: KnowledgeBaseType;
};

export type KnowledgeBaseQa = {
  __typename?: 'KnowledgeBaseQA';
  answer: Scalars['String'];
  date_created: Scalars['DateTime'];
  date_updated?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  knowledge_base: Array<KnowledgeBase>;
  question: Scalars['String'];
};

export enum KnowledgeBaseType {
  /** Q&A */
  Qa = 'qa'
}

export enum LanguageCode {
  En = 'en',
  Pt = 'pt'
}

export type LoginUserInput = {
  email: Scalars['String'];
  password: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  batchUpdateFlowContact: Array<FlowContact>;
  createAccountApiKey: AccountApiKey;
  createAffiliateForUser: AffiliateSettingsResult;
  createDebugInteraction: CreateDebugInteractionResult;
  createExtraCreditCheckout: CreateExtraCreditCheckoutResult;
  createFlow: Flow;
  createFlowAgent: FlowAgent;
  createFlowContactSegment: FlowContactSegment;
  createKnowledgeBase: KnowledgeBase;
  createKnowledgeBaseQA: Array<KnowledgeBaseQa>;
  createQuotation: Quotation;
  createQuotationQuestion: Array<QuotationQuestion>;
  createSubscriptionCheckout: CreateSubscriptionCheckoutResult;
  deleteAccountApiKey?: Maybe<Scalars['Boolean']>;
  deleteFlow: Scalars['Boolean'];
  deleteFlowAgent: Scalars['Boolean'];
  deleteFlowSegment: Scalars['Boolean'];
  deleteKnowledgeBase: Scalars['Boolean'];
  deleteKnowledgeBaseQA: Scalars['Boolean'];
  deleteQuotation: Scalars['Boolean'];
  deleteQuotationQuestion: Scalars['Boolean'];
  importFlowContactsFromCsv: ImportFlowContactsFromCsvResult;
  loginUser: UserAuthResult;
  logoutUser: Scalars['Boolean'];
  registerOnboardingStepForAccount?: Maybe<OnBoardingStep>;
  registerUser: RegisterUserResult;
  requestUserEmailVerification: Scalars['Boolean'];
  requestUserPasswordReset: Scalars['Boolean'];
  resetUserPassword: VerifyUserEmailResult;
  toggleFlowContactInSegment: Array<FlowContact>;
  toggleQuotationRequestCheck: Array<QuotationRequest>;
  updateAccountSettings?: Maybe<Account>;
  updateAccountWidgetConfig?: Maybe<WidgetConfig>;
  updateFlow: Flow;
  updateFlowAgent: FlowAgent;
  updateFlowContactSegment: FlowContactSegment;
  updateKnowledge: KnowledgeBase;
  updateKnowledgeBaseQA: KnowledgeBaseQa;
  updateQuotation: Quotation;
  updateQuotationQuestion: QuotationQuestion;
  updateUser: UserAuthResult;
  updateUserAffiliate?: Maybe<AffiliateSettingsResult>;
  uploadFile: Array<Asset>;
  verifyUserEmail: VerifyUserEmailResult;
  visualizeQuotationRequest?: Maybe<Scalars['Boolean']>;
};


export type MutationBatchUpdateFlowContactArgs = {
  input: Array<BatchUpdateFlowContact>;
};


export type MutationCreateAccountApiKeyArgs = {
  input?: InputMaybe<CreateAccountApiKeyInput>;
};


export type MutationCreateAffiliateForUserArgs = {
  input: CreateUserAffiliateInput;
};


export type MutationCreateDebugInteractionArgs = {
  input: CreateDebugInteractionInput;
};


export type MutationCreateExtraCreditCheckoutArgs = {
  input: CreateExtraCreditCheckoutInput;
};


export type MutationCreateFlowArgs = {
  input: CreateFlowInput;
};


export type MutationCreateFlowAgentArgs = {
  input: CreateFlowAgentInput;
};


export type MutationCreateFlowContactSegmentArgs = {
  input: CreateFlowContactSegmentInput;
};


export type MutationCreateKnowledgeBaseArgs = {
  accountId: Scalars['ID'];
  input: CreateKnowledgeBaseInput;
};


export type MutationCreateKnowledgeBaseQaArgs = {
  input: Array<CreateKnowledgeBaseQaInput>;
};


export type MutationCreateQuotationArgs = {
  input: CreateQuotationInput;
};


export type MutationCreateQuotationQuestionArgs = {
  input: Array<CreateQuotationQuestionInput>;
};


export type MutationCreateSubscriptionCheckoutArgs = {
  input: CreateSubscriptionCheckoutInput;
};


export type MutationDeleteAccountApiKeyArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteFlowArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteFlowAgentArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteFlowSegmentArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteKnowledgeBaseArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteKnowledgeBaseQaArgs = {
  id: Array<Scalars['ID']>;
};


export type MutationDeleteQuotationArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteQuotationQuestionArgs = {
  id: Scalars['ID'];
};


export type MutationImportFlowContactsFromCsvArgs = {
  csv: Scalars['Upload'];
  input: ImportFlowContactsFromCsvInput;
};


export type MutationLoginUserArgs = {
  input: LoginUserInput;
};


export type MutationRegisterOnboardingStepForAccountArgs = {
  accountId: Scalars['ID'];
  step: OnBoardingStepName;
};


export type MutationRegisterUserArgs = {
  input: RegisterUserInput;
};


export type MutationRequestUserEmailVerificationArgs = {
  id: Scalars['String'];
};


export type MutationRequestUserPasswordResetArgs = {
  email: Scalars['String'];
};


export type MutationResetUserPasswordArgs = {
  input: ResetUserPasswordInput;
};


export type MutationToggleFlowContactInSegmentArgs = {
  input?: InputMaybe<ToggleFlowContactInSegmentInput>;
};


export type MutationToggleQuotationRequestCheckArgs = {
  requestId: Array<InputMaybe<Scalars['ID']>>;
};


export type MutationUpdateAccountSettingsArgs = {
  input: UpdateAccountSettingsInput;
};


export type MutationUpdateAccountWidgetConfigArgs = {
  accountId: Scalars['ID'];
  input: WidgetConfigInput;
};


export type MutationUpdateFlowArgs = {
  input: UpdateFlowInput;
};


export type MutationUpdateFlowAgentArgs = {
  input: UpdateFlowAgentInput;
};


export type MutationUpdateFlowContactSegmentArgs = {
  input: UpdateFlowContactSegmentInput;
};


export type MutationUpdateKnowledgeArgs = {
  input: UpdateKnowledgeBaseInput;
};


export type MutationUpdateKnowledgeBaseQaArgs = {
  input: UpdateKnowledgeBaseQaInput;
};


export type MutationUpdateQuotationArgs = {
  input: UpdateQuotationInput;
};


export type MutationUpdateQuotationQuestionArgs = {
  input: UpdateQuotationQuestionInput;
};


export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};


export type MutationUpdateUserAffiliateArgs = {
  input: UpdateUserAffiliateInput;
};


export type MutationUploadFileArgs = {
  file: Scalars['Upload'];
};


export type MutationVerifyUserEmailArgs = {
  id: Scalars['String'];
  token: Scalars['String'];
};


export type MutationVisualizeQuotationRequestArgs = {
  requestId: Array<Scalars['ID']>;
};

export type NumberFilter = {
  equals?: InputMaybe<Scalars['Float']>;
  gt?: InputMaybe<Scalars['Float']>;
  gte?: InputMaybe<Scalars['Float']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['Float']>>>;
  lt?: InputMaybe<Scalars['Float']>;
  lte?: InputMaybe<Scalars['Float']>;
  not?: InputMaybe<Scalars['Float']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Float']>>>;
};

export type OnBoardingStep = {
  __typename?: 'OnBoardingStep';
  date_created: Scalars['String'];
  id: Scalars['ID'];
  module: AccountUsageKind;
  name: OnBoardingStepName;
};

export enum OnBoardingStepName {
  CreateFirstQuotation = 'create_first_quotation',
  FinishSetupAccount = 'finish_setup_account',
  FirstQuotationCopyLink = 'first_quotation_copy_link',
  ReceiveFirstQuotationRequest = 'receive_first_quotation_request',
  SetupWidgetSettings = 'setup_widget_settings'
}

export type PaginatedAffiliateComissionList = {
  __typename?: 'PaginatedAffiliateComissionList';
  items: Array<AffiliateComission>;
  totalItems: Scalars['Int'];
};

export type PaginatedAffiliateComissionListOptions = {
  skip?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<AffiliateComissionListSort>;
  take?: InputMaybe<Scalars['Int']>;
};

export type PaginatedFlowContactListOptions = {
  skip?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<FlowContactListSort>;
  take?: InputMaybe<Scalars['Int']>;
};

export type PaginatedFlowContactsList = {
  __typename?: 'PaginatedFlowContactsList';
  items: Array<FlowContact>;
  totalItems: Scalars['Int'];
};

export type PaginatedFlowRecordingList = {
  __typename?: 'PaginatedFlowRecordingList';
  items: Array<FlowRecording>;
  totalItems: Scalars['Int'];
};

export type PaginatedFlowRecordingListOptions = {
  skip?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<FlowRecordingListSort>;
  take?: InputMaybe<Scalars['Int']>;
};

export type PaginatedQuotationRequestList = {
  __typename?: 'PaginatedQuotationRequestList';
  items: Array<QuotationRequest>;
  totalItems: Scalars['Int'];
};

export type PaginatedQuotationRequestListOptions = {
  skip?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<QuotationRequestSearch>;
  take?: InputMaybe<Scalars['Int']>;
};

export enum Permissions {
  ListUsers = 'ListUsers',
  SuperAdmin = 'SuperAdmin'
}

export enum PlanInterval {
  Month = 'month',
  Year = 'year'
}

export type PublicQuotation = {
  __typename?: 'PublicQuotation';
  hash: Scalars['String'];
  title: Scalars['String'];
  widget_config?: Maybe<WidgetConfig>;
};

export type Query = {
  __typename?: 'Query';
  account?: Maybe<Account>;
  accountApiKeys: Array<AccountApiKey>;
  accountFlow?: Maybe<Flow>;
  accountFlowAgent?: Maybe<FlowAgent>;
  accountFlowAgents: Array<FlowAgent>;
  accountFlowContacts: PaginatedFlowContactsList;
  accountFlowSegment?: Maybe<FlowContactSegment>;
  accountFlowSegments: Array<FlowContactSegment>;
  accountFlows: Array<Flow>;
  accountKnowledgeBases: Array<KnowledgeBase>;
  accountQuotation?: Maybe<Quotation>;
  accountQuotationRequest?: Maybe<QuotationRequest>;
  accountQuotationRequests: PaginatedQuotationRequestList;
  accountQuotations: Array<Quotation>;
  accountSubscriptionData?: Maybe<AccountSubscriptionData>;
  accountWidgetSettings?: Maybe<WidgetConfig>;
  activeUser?: Maybe<ActiveUser>;
  activeUserAffiliate?: Maybe<Affiliate>;
  affiliateComissions?: Maybe<PaginatedAffiliateComissionList>;
  affiliateComissionsCalcs: AffiliateComissionsCalcs;
  availableSegments: Array<Segment>;
  flowRecordings: PaginatedFlowRecordingList;
  isAffiliateAliasAvailable: Scalars['Boolean'];
  knowledgeBase?: Maybe<KnowledgeBase>;
  knowledgeBaseQA?: Maybe<KnowledgeBaseQa>;
  quotationModelBySegment?: Maybe<Quotation>;
  subscriptionPlans: Array<SubscriptionPlan>;
  subscriptionPortal: SubscriptionPortalResult;
};


export type QueryAccountArgs = {
  id: Scalars['ID'];
};


export type QueryAccountApiKeysArgs = {
  accountId: Scalars['ID'];
};


export type QueryAccountFlowArgs = {
  id: Scalars['ID'];
};


export type QueryAccountFlowAgentArgs = {
  id: Scalars['ID'];
};


export type QueryAccountFlowAgentsArgs = {
  account: Scalars['ID'];
};


export type QueryAccountFlowContactsArgs = {
  accountId: Scalars['ID'];
  filter?: InputMaybe<FlowContactListFilter>;
  pagination?: InputMaybe<PaginatedFlowContactListOptions>;
};


export type QueryAccountFlowSegmentArgs = {
  id: Scalars['ID'];
};


export type QueryAccountFlowSegmentsArgs = {
  account: Scalars['ID'];
};


export type QueryAccountFlowsArgs = {
  accountId: Scalars['ID'];
};


export type QueryAccountKnowledgeBasesArgs = {
  accountId: Scalars['ID'];
};


export type QueryAccountQuotationArgs = {
  id: Scalars['ID'];
};


export type QueryAccountQuotationRequestArgs = {
  quotationId: Scalars['ID'];
  requestSequentialId: Scalars['ID'];
};


export type QueryAccountQuotationRequestsArgs = {
  accountId: Scalars['ID'];
  filter?: InputMaybe<QuotationRequestFilter>;
  pagination?: InputMaybe<PaginatedQuotationRequestListOptions>;
};


export type QueryAccountQuotationsArgs = {
  account: Scalars['ID'];
  mode: SoftDeleteQueryMode;
};


export type QueryAccountSubscriptionDataArgs = {
  accountId: Scalars['ID'];
};


export type QueryAccountWidgetSettingsArgs = {
  accountId: Scalars['ID'];
};


export type QueryAffiliateComissionsArgs = {
  filter?: InputMaybe<AffiliateComissionsListFilter>;
  pagination?: InputMaybe<PaginatedAffiliateComissionListOptions>;
};


export type QueryFlowRecordingsArgs = {
  accountId: Scalars['ID'];
  filter?: InputMaybe<FlowRecordingListFilter>;
  pagination?: InputMaybe<PaginatedFlowRecordingListOptions>;
};


export type QueryIsAffiliateAliasAvailableArgs = {
  alias: Scalars['String'];
};


export type QueryKnowledgeBaseArgs = {
  id: Scalars['ID'];
};


export type QueryKnowledgeBaseQaArgs = {
  id: Scalars['ID'];
};


export type QueryQuotationModelBySegmentArgs = {
  segmentId: Scalars['ID'];
};


export type QuerySubscriptionPortalArgs = {
  input: SubscriptionPortalInput;
};

export type Quotation = {
  __typename?: 'Quotation';
  date_created: Scalars['DateTime'];
  date_deleted?: Maybe<Scalars['DateTime']>;
  date_updated?: Maybe<Scalars['DateTime']>;
  hash: Scalars['String'];
  id: Scalars['ID'];
  prompt_instructions?: Maybe<Scalars['String']>;
  questions?: Maybe<Array<QuotationQuestion>>;
  questions_count: Scalars['Int'];
  requests_count: Scalars['Int'];
  status: QuotationStatus;
  title: Scalars['String'];
  widget_config?: Maybe<WidgetConfig>;
};

export type QuotationConversation = {
  __typename?: 'QuotationConversation';
  id: Scalars['ID'];
  message: Array<QuotationConversationMessage>;
  quotation?: Maybe<PublicQuotation>;
  recipient?: Maybe<QuotationConversationRecipient>;
  status: QuotationConversationStatus;
};

export type QuotationConversationMessage = {
  __typename?: 'QuotationConversationMessage';
  content: Scalars['String'];
  is_ending_message?: Maybe<Scalars['Boolean']>;
  role: QuotationMessageRole;
  sent_at: Scalars['DateTime'];
};

export type QuotationConversationRecipient = {
  __typename?: 'QuotationConversationRecipient';
  email?: Maybe<Scalars['String']>;
  first_name?: Maybe<Scalars['String']>;
  last_name?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
};

export type QuotationConversationRecipientInput = {
  email: Scalars['String'];
  first_name: Scalars['String'];
  last_name: Scalars['String'];
  phone?: InputMaybe<Scalars['String']>;
};

export enum QuotationConversationStatus {
  Active = 'active',
  Finished = 'finished'
}

export enum QuotationMessageRole {
  Agent = 'agent',
  Customer = 'customer'
}

export type QuotationQuestion = {
  __typename?: 'QuotationQuestion';
  active: Scalars['Boolean'];
  condition?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  label: Scalars['String'];
  order: Scalars['Int'];
  parent?: Maybe<Scalars['String']>;
  quotation: Scalars['String'];
};

export type QuotationRequest = {
  __typename?: 'QuotationRequest';
  checked_at?: Maybe<Scalars['DateTime']>;
  checked_by?: Maybe<User>;
  conversation: QuotationConversation;
  data?: Maybe<Array<QuotationRequestData>>;
  date_created: Scalars['DateTime'];
  date_updated?: Maybe<Scalars['DateTime']>;
  id: Scalars['String'];
  quotation: Quotation;
  sequential_id: Scalars['String'];
  visualized_at?: Maybe<Scalars['DateTime']>;
};

export type QuotationRequestData = {
  __typename?: 'QuotationRequestData';
  answer: Scalars['String'];
  question: Scalars['String'];
};

export type QuotationRequestFilter = {
  is_checked?: InputMaybe<Scalars['Boolean']>;
  operator: FilterOperator;
  quotation?: InputMaybe<Scalars['ID']>;
  recipientQuery?: InputMaybe<Scalars['String']>;
};

export type QuotationRequestSearch = {
  date_created?: InputMaybe<SortOrder>;
  date_updated?: InputMaybe<SortOrder>;
};

export enum QuotationStatus {
  Archived = 'archived',
  Published = 'published'
}

export type RegisterUserInput = {
  email: Scalars['String'];
  first_name: Scalars['String'];
  language?: InputMaybe<LanguageCode>;
  last_name: Scalars['String'];
  password: Scalars['String'];
  referrer?: InputMaybe<Scalars['String']>;
};

export type RegisterUserResult = UserAuthError | UserRegistered;

export type ResetUserPasswordError = {
  __typename?: 'ResetUserPasswordError';
  errorCode?: Maybe<ResetUserPasswordErrorCode>;
  message: Scalars['String'];
};

export enum ResetUserPasswordErrorCode {
  ExpiredToken = 'EXPIRED_TOKEN',
  InvalidToken = 'INVALID_TOKEN'
}

export type ResetUserPasswordInput = {
  password: Scalars['String'];
  token: Scalars['String'];
};

export type ResetUserPasswordResult = ResetUserPasswordError | User;

export type Segment = {
  __typename?: 'Segment';
  id: Scalars['ID'];
  title: Scalars['String'];
  translations: Array<Translation>;
};

export enum SoftDeleteQueryMode {
  ShowAll = 'show_all',
  ShowOnlyDeleted = 'show_only_deleted',
  ShowOnlyNotDeleted = 'show_only_not_deleted'
}

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc'
}

export type SubscriptionPlan = {
  __typename?: 'SubscriptionPlan';
  benefits?: Maybe<Array<Maybe<Translation>>>;
  id: Scalars['ID'];
  name: Scalars['String'];
  prices: Array<SubscriptionPlanPrice>;
};

export type SubscriptionPlanPrice = {
  __typename?: 'SubscriptionPlanPrice';
  currency: CurrencyCode;
  external_id: Scalars['String'];
  interval: PlanInterval;
  price: Scalars['String'];
};

export type SubscriptionPortalInput = {
  accountId: Scalars['ID'];
};

export type SubscriptionPortalResult = {
  __typename?: 'SubscriptionPortalResult';
  url: Scalars['String'];
};

export enum SubscriptionStatus {
  Active = 'active',
  Cancelled = 'cancelled',
  Pending = 'pending',
  Trialing = 'trialing'
}

export type ToggleFlowContactInSegmentInput = {
  contactId: Array<Scalars['ID']>;
  mode: ToggleFlowContactInSegmentMode;
  segmentId: Scalars['ID'];
};

export enum ToggleFlowContactInSegmentMode {
  Add = 'ADD',
  Remove = 'REMOVE'
}

export type Translation = {
  __typename?: 'Translation';
  language: LanguageCode;
  value: Scalars['String'];
};

export type UpdateAccountSettingsInput = {
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
  segment?: InputMaybe<Scalars['ID']>;
  website?: InputMaybe<Scalars['String']>;
};

export type UpdateFlowAgentInput = {
  editor_type?: InputMaybe<FlowAgentEditorType>;
  id: Scalars['ID'];
  knowledge_base?: InputMaybe<Scalars['ID']>;
  script?: InputMaybe<Scalars['String']>;
  script_language?: InputMaybe<Scalars['String']>;
  script_schema?: InputMaybe<Scalars['JSON']>;
  title?: InputMaybe<Scalars['String']>;
  voice?: InputMaybe<FlowAgentVoice>;
};

export type UpdateFlowContactSegmentInput = {
  id: Scalars['ID'];
  label?: InputMaybe<Scalars['String']>;
};

export type UpdateFlowInput = {
  agent?: InputMaybe<Scalars['ID']>;
  daily_budget?: InputMaybe<Scalars['Float']>;
  id: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
  segment?: InputMaybe<Scalars['ID']>;
  status?: InputMaybe<FlowStatus>;
};

export type UpdateKnowledgeBaseInput = {
  id: Scalars['ID'];
  title?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<KnowledgeBaseType>;
};

export type UpdateKnowledgeBaseQaInput = {
  answer?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  /** Will set */
  knowledge_base_id?: InputMaybe<Array<Scalars['ID']>>;
  question?: InputMaybe<Scalars['String']>;
};

export type UpdateQuotationInput = {
  data_structure?: InputMaybe<Scalars['JSON']>;
  id: Scalars['ID'];
  prompt_instructions?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<QuotationStatus>;
  title?: InputMaybe<Scalars['String']>;
  widget_config?: InputMaybe<WidgetConfigInput>;
};

export type UpdateQuotationQuestionInput = {
  active?: InputMaybe<Scalars['Boolean']>;
  condition?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  label?: InputMaybe<Scalars['String']>;
  order?: InputMaybe<Scalars['Int']>;
  parent?: InputMaybe<Scalars['ID']>;
};

export type UpdateUserAffiliateInput = {
  alias?: InputMaybe<Scalars['String']>;
  password: Scalars['String'];
  payout_method?: InputMaybe<AffiliatePayoutMethod>;
  payout_method_key?: InputMaybe<Scalars['String']>;
};

export type UpdateUserInput = {
  email?: InputMaybe<Scalars['String']>;
  first_name?: InputMaybe<Scalars['String']>;
  language?: InputMaybe<LanguageCode>;
  last_name?: InputMaybe<Scalars['String']>;
  /** Required for password change */
  old_password?: InputMaybe<Scalars['String']>;
  password?: InputMaybe<Scalars['String']>;
};

export type User = {
  __typename?: 'User';
  email: Scalars['String'];
  first_name: Scalars['String'];
  id: Scalars['ID'];
  last_name: Scalars['String'];
};

export type UserAccount = {
  __typename?: 'UserAccount';
  account: Account;
  account_id: Scalars['ID'];
  allowed_modules: Array<AccountUsageKind>;
  role: AccountRole;
  user: User;
  user_id: Scalars['ID'];
};

export type UserAuthError = {
  __typename?: 'UserAuthError';
  errorCode: UserAuthErrorCode;
  message: Scalars['String'];
};

export enum UserAuthErrorCode {
  EmailAlreadyExists = 'EMAIL_ALREADY_EXISTS',
  EmailNotVerified = 'EMAIL_NOT_VERIFIED',
  InvalidCredentials = 'INVALID_CREDENTIALS'
}

export type UserAuthResult = ActiveUser | UserAuthError;

export type UserRegistered = {
  __typename?: 'UserRegistered';
  created_id: Scalars['ID'];
  should_verify_email: Scalars['Boolean'];
};

export type VerifyUserEmailError = {
  __typename?: 'VerifyUserEmailError';
  errorCode?: Maybe<VerifyUserEmailErrorCode>;
  message: Scalars['String'];
};

export enum VerifyUserEmailErrorCode {
  ExpiredToken = 'EXPIRED_TOKEN',
  InvalidToken = 'INVALID_TOKEN'
}

export type VerifyUserEmailResult = ActiveUser | VerifyUserEmailError;

export type WidgetConfig = {
  __typename?: 'WidgetConfig';
  allowed_domains?: Maybe<Array<Scalars['String']>>;
  avatar?: Maybe<Asset>;
  button_color?: Maybe<Scalars['String']>;
  button_font_size?: Maybe<Scalars['String']>;
  button_icon_color?: Maybe<Scalars['String']>;
  button_size?: Maybe<Scalars['Int']>;
  button_text?: Maybe<Scalars['String']>;
  button_text_color?: Maybe<Scalars['String']>;
  distance_from_border?: Maybe<Scalars['Int']>;
  font_size?: Maybe<Scalars['Int']>;
  google_font?: Maybe<Scalars['String']>;
  height?: Maybe<Scalars['String']>;
  hide_powered_by?: Maybe<Scalars['Boolean']>;
  icon?: Maybe<Asset>;
  initially_open?: Maybe<Scalars['Boolean']>;
  main_color?: Maybe<Scalars['String']>;
  position?: Maybe<Scalars['String']>;
  theme?: Maybe<WidgetTheme>;
  title?: Maybe<Scalars['String']>;
  width?: Maybe<Scalars['String']>;
};

export type WidgetConfigInput = {
  allowed_domains?: InputMaybe<Array<Scalars['String']>>;
  avatar?: InputMaybe<Scalars['ID']>;
  button_color?: InputMaybe<Scalars['String']>;
  button_font_size?: InputMaybe<Scalars['String']>;
  button_icon_color?: InputMaybe<Scalars['String']>;
  button_size?: InputMaybe<Scalars['Int']>;
  button_text?: InputMaybe<Scalars['String']>;
  button_text_color?: InputMaybe<Scalars['String']>;
  distance_from_border?: InputMaybe<Scalars['Int']>;
  font_size?: InputMaybe<Scalars['Int']>;
  google_font?: InputMaybe<Scalars['String']>;
  height?: InputMaybe<Scalars['String']>;
  hide_powered_by?: InputMaybe<Scalars['Boolean']>;
  icon?: InputMaybe<Scalars['ID']>;
  initially_open?: InputMaybe<Scalars['Boolean']>;
  main_color?: InputMaybe<Scalars['String']>;
  position?: InputMaybe<Scalars['String']>;
  theme?: InputMaybe<WidgetTheme>;
  title?: InputMaybe<Scalars['String']>;
  width?: InputMaybe<Scalars['String']>;
};

export enum WidgetTheme {
  Both = 'both',
  Dark = 'dark',
  Light = 'light'
}

export type AccountApiKeyFragment = { __typename?: 'AccountApiKey', id: string, name?: string | null, token?: string | null, maskedToken: string, date_updated?: any | null, date_created: any };

export type CreateAccountApiKeyMutationVariables = Exact<{
  input?: InputMaybe<CreateAccountApiKeyInput>;
}>;


export type CreateAccountApiKeyMutation = { __typename?: 'Mutation', createAccountApiKey: { __typename?: 'AccountApiKey', id: string, name?: string | null, token?: string | null, maskedToken: string, date_updated?: any | null, date_created: any } };

export type DeleteAccountApiKeyMutationVariables = Exact<{
  deleteAccountApiKeyId: Scalars['ID'];
}>;


export type DeleteAccountApiKeyMutation = { __typename?: 'Mutation', deleteAccountApiKey?: boolean | null };

export type AccountApiKeysQueryVariables = Exact<{
  accountId: Scalars['ID'];
}>;


export type AccountApiKeysQuery = { __typename?: 'Query', accountApiKeys: Array<{ __typename?: 'AccountApiKey', id: string, name?: string | null, token?: string | null, maskedToken: string, date_updated?: any | null, date_created: any }> };

export type AffiliateFragment = { __typename?: 'Affiliate', id: string, status: AffiliateStatus, alias: string, comission_duration_months?: number | null, comission_percentage?: number | null, payout_method?: AffiliatePayoutMethod | null, payout_method_key?: string | null, date_created: any, date_updated?: any | null };

export type AffiliateComissionFragment = { __typename?: 'AffiliateComission', id: string, status: AffiliateComissionStatus, date_payment?: any | null, amount: number, date_created: any };

export type AffiliateComissionsCalcsFragment = { __typename?: 'AffiliateComissionsCalcs', nextPaymentDate: any, pendingAmountToReceive: number, amountOfUsersIndicated: number, receivedLastMonth: number };

export type ActiveUserAffiliateQueryVariables = Exact<{ [key: string]: never; }>;


export type ActiveUserAffiliateQuery = { __typename?: 'Query', activeUserAffiliate?: { __typename?: 'Affiliate', id: string, status: AffiliateStatus, alias: string, comission_duration_months?: number | null, comission_percentage?: number | null, payout_method?: AffiliatePayoutMethod | null, payout_method_key?: string | null, date_created: any, date_updated?: any | null } | null };

export type CreateAffiliateForUserMutationVariables = Exact<{
  input: CreateUserAffiliateInput;
}>;


export type CreateAffiliateForUserMutation = { __typename?: 'Mutation', createAffiliateForUser: { __typename?: 'Affiliate', id: string, status: AffiliateStatus, alias: string, comission_duration_months?: number | null, comission_percentage?: number | null, payout_method?: AffiliatePayoutMethod | null, payout_method_key?: string | null, date_created: any, date_updated?: any | null } | { __typename?: 'AffiliateSettingsResultError', errorCode: AffiliateSettingsResultErrorCode, message: string } };

export type UpdateUserAffiliateMutationVariables = Exact<{
  input: UpdateUserAffiliateInput;
}>;


export type UpdateUserAffiliateMutation = { __typename?: 'Mutation', updateUserAffiliate?: { __typename?: 'Affiliate', id: string, status: AffiliateStatus, alias: string, comission_duration_months?: number | null, comission_percentage?: number | null, payout_method?: AffiliatePayoutMethod | null, payout_method_key?: string | null, date_created: any, date_updated?: any | null } | { __typename?: 'AffiliateSettingsResultError', errorCode: AffiliateSettingsResultErrorCode, message: string } | null };

export type IsAffiliateAliasAvailableQueryVariables = Exact<{
  alias: Scalars['String'];
}>;


export type IsAffiliateAliasAvailableQuery = { __typename?: 'Query', isAffiliateAliasAvailable: boolean };

export type AffiliateComissionsCalcsQueryVariables = Exact<{
  to?: InputMaybe<Scalars['DateTime']>;
  from?: InputMaybe<Scalars['DateTime']>;
}>;


export type AffiliateComissionsCalcsQuery = { __typename?: 'Query', affiliateComissionsCalcs: { __typename?: 'AffiliateComissionsCalcs', nextPaymentDate: any, pendingAmountToReceive: number, amountOfUsersIndicated: number, receivedLastMonth: number }, activeUserAffiliate?: { __typename?: 'Affiliate', id: string, status: AffiliateStatus, alias: string, comission_duration_months?: number | null, comission_percentage?: number | null, payout_method?: AffiliatePayoutMethod | null, payout_method_key?: string | null, date_created: any, date_updated?: any | null } | null };

export type AffiliateComissionQueryVariables = Exact<{
  pagination?: InputMaybe<PaginatedAffiliateComissionListOptions>;
  filter?: InputMaybe<AffiliateComissionsListFilter>;
}>;


export type AffiliateComissionQuery = { __typename?: 'Query', affiliateComissions?: { __typename?: 'PaginatedAffiliateComissionList', totalItems: number, items: Array<{ __typename?: 'AffiliateComission', id: string, status: AffiliateComissionStatus, date_payment?: any | null, amount: number, date_created: any }> } | null };

export type AccountSubscriptionDataFragment = { __typename?: 'AccountSubscriptionData', credits: number, plan: string, plan_interval: PlanInterval, period_start: any, period_end: any };

export type AccountSubscriptionDataQueryVariables = Exact<{
  accountId: Scalars['ID'];
}>;


export type AccountSubscriptionDataQuery = { __typename?: 'Query', accountSubscriptionData?: { __typename?: 'AccountSubscriptionData', credits: number, plan: string, plan_interval: PlanInterval, period_start: any, period_end: any } | null };

export type SubscriptionPortalQueryVariables = Exact<{
  input: SubscriptionPortalInput;
}>;


export type SubscriptionPortalQuery = { __typename?: 'Query', subscriptionPortal: { __typename?: 'SubscriptionPortalResult', url: string } };

export type CreateExtraCreditCheckoutMutationVariables = Exact<{
  input: CreateExtraCreditCheckoutInput;
}>;


export type CreateExtraCreditCheckoutMutation = { __typename?: 'Mutation', createExtraCreditCheckout: { __typename?: 'CreateExtraCreditCheckoutResult', url: string } };

export type FlowAgentFragment = { __typename?: 'FlowAgent', id: string, title: string, script?: string | null, script_schema?: any | null, script_language?: string | null, voice: FlowAgentVoice, editor_type: FlowAgentEditorType, date_created: any, date_updated?: any | null, knowledge_base?: { __typename?: 'KnowledgeBase', id: string, title: string, type: KnowledgeBaseType, date_created: any, date_updated?: any | null, qa: Array<{ __typename?: 'KnowledgeBaseQA', id: string, question: string, answer: string, date_created: any, date_updated?: any | null, knowledge_base: Array<{ __typename?: 'KnowledgeBase', id: string, title: string }> }> } | null };

export type CreateFlowAgentMutationVariables = Exact<{
  input: CreateFlowAgentInput;
}>;


export type CreateFlowAgentMutation = { __typename?: 'Mutation', createFlowAgent: { __typename?: 'FlowAgent', id: string, title: string, script?: string | null, script_schema?: any | null, script_language?: string | null, voice: FlowAgentVoice, editor_type: FlowAgentEditorType, date_created: any, date_updated?: any | null, knowledge_base?: { __typename?: 'KnowledgeBase', id: string, title: string, type: KnowledgeBaseType, date_created: any, date_updated?: any | null, qa: Array<{ __typename?: 'KnowledgeBaseQA', id: string, question: string, answer: string, date_created: any, date_updated?: any | null, knowledge_base: Array<{ __typename?: 'KnowledgeBase', id: string, title: string }> }> } | null } };

export type UpdateFlowAgentMutationVariables = Exact<{
  input: UpdateFlowAgentInput;
}>;


export type UpdateFlowAgentMutation = { __typename?: 'Mutation', updateFlowAgent: { __typename?: 'FlowAgent', id: string, title: string, script?: string | null, script_schema?: any | null, script_language?: string | null, voice: FlowAgentVoice, editor_type: FlowAgentEditorType, date_created: any, date_updated?: any | null, knowledge_base?: { __typename?: 'KnowledgeBase', id: string, title: string, type: KnowledgeBaseType, date_created: any, date_updated?: any | null, qa: Array<{ __typename?: 'KnowledgeBaseQA', id: string, question: string, answer: string, date_created: any, date_updated?: any | null, knowledge_base: Array<{ __typename?: 'KnowledgeBase', id: string, title: string }> }> } | null } };

export type AccountFlowAgentQueryVariables = Exact<{
  accountFlowAgentId: Scalars['ID'];
}>;


export type AccountFlowAgentQuery = { __typename?: 'Query', accountFlowAgent?: { __typename?: 'FlowAgent', id: string, title: string, script?: string | null, script_schema?: any | null, script_language?: string | null, voice: FlowAgentVoice, editor_type: FlowAgentEditorType, date_created: any, date_updated?: any | null, knowledge_base?: { __typename?: 'KnowledgeBase', id: string, title: string, type: KnowledgeBaseType, date_created: any, date_updated?: any | null, qa: Array<{ __typename?: 'KnowledgeBaseQA', id: string, question: string, answer: string, date_created: any, date_updated?: any | null, knowledge_base: Array<{ __typename?: 'KnowledgeBase', id: string, title: string }> }> } | null } | null };

export type AccountFlowAgentsQueryVariables = Exact<{
  account: Scalars['ID'];
}>;


export type AccountFlowAgentsQuery = { __typename?: 'Query', accountFlowAgents: Array<{ __typename?: 'FlowAgent', id: string, title: string, script?: string | null, script_schema?: any | null, script_language?: string | null, voice: FlowAgentVoice, editor_type: FlowAgentEditorType, date_created: any, date_updated?: any | null, knowledge_base?: { __typename?: 'KnowledgeBase', id: string, title: string, type: KnowledgeBaseType, date_created: any, date_updated?: any | null, qa: Array<{ __typename?: 'KnowledgeBaseQA', id: string, question: string, answer: string, date_created: any, date_updated?: any | null, knowledge_base: Array<{ __typename?: 'KnowledgeBase', id: string, title: string }> }> } | null }> };

export type DeleteFlowAgentMutationVariables = Exact<{
  deleteFlowAgentId: Scalars['ID'];
}>;


export type DeleteFlowAgentMutation = { __typename?: 'Mutation', deleteFlowAgent: boolean };

export type CreateDebugInteractionMutationVariables = Exact<{
  input: CreateDebugInteractionInput;
}>;


export type CreateDebugInteractionMutation = { __typename?: 'Mutation', createDebugInteraction: { __typename?: 'DebugInteractionCreated', interactionId: string } | { __typename?: 'DebugInteractionError', errorCode: DebugInteractionErrorCode, message: string } };

export type FlowContactSegmentFragment = { __typename?: 'FlowContactSegment', id: string, label: string };

export type FlowContactSegmentWithMetricsFragment = { __typename?: 'FlowContactSegment', id: string, label: string, flow_contacts_count: number, flow_instances_count: number };

export type CreateFlowContactSegmentMutationVariables = Exact<{
  input: CreateFlowContactSegmentInput;
}>;


export type CreateFlowContactSegmentMutation = { __typename?: 'Mutation', createFlowContactSegment: { __typename?: 'FlowContactSegment', id: string, label: string, flow_contacts_count: number, flow_instances_count: number } };

export type AccountFlowSegmentsQueryVariables = Exact<{
  accountId: Scalars['ID'];
}>;


export type AccountFlowSegmentsQuery = { __typename?: 'Query', accountFlowSegments: Array<{ __typename?: 'FlowContactSegment', id: string, label: string }> };

export type AccountFlowSegmentsWithMetricsQueryVariables = Exact<{
  accountId: Scalars['ID'];
}>;


export type AccountFlowSegmentsWithMetricsQuery = { __typename?: 'Query', accountFlowSegments: Array<{ __typename?: 'FlowContactSegment', id: string, label: string, flow_contacts_count: number, flow_instances_count: number }> };

export type AccountFlowSegmentQueryVariables = Exact<{
  accountFlowSegmentId: Scalars['ID'];
}>;


export type AccountFlowSegmentQuery = { __typename?: 'Query', accountFlowSegment?: { __typename?: 'FlowContactSegment', id: string, label: string } | null };

export type UpdateFlowContactSegmentMutationVariables = Exact<{
  input: UpdateFlowContactSegmentInput;
}>;


export type UpdateFlowContactSegmentMutation = { __typename?: 'Mutation', updateFlowContactSegment: { __typename?: 'FlowContactSegment', id: string, label: string, flow_contacts_count: number, flow_instances_count: number } };

export type DeleteFlowSegmentMutationVariables = Exact<{
  deleteFlowSegmentId: Scalars['ID'];
}>;


export type DeleteFlowSegmentMutation = { __typename?: 'Mutation', deleteFlowSegment: boolean };

export type FlowContactFragment = { __typename?: 'FlowContact', id: string, first_name: string, last_name: string, email?: string | null, phone: string, status: FlowContactStatus, date_updated?: any | null, date_created: any, segments: Array<{ __typename?: 'FlowContactSegment', id: string, label: string }> };

export type ImportFlowContactsFromCsvMutationVariables = Exact<{
  csv: Scalars['Upload'];
  input: ImportFlowContactsFromCsvInput;
}>;


export type ImportFlowContactsFromCsvMutation = { __typename?: 'Mutation', importFlowContactsFromCsv: { __typename?: 'ImportFlowContactsError', errorCode: ImportFlowContactsErrorCode, message: string } | { __typename?: 'ImportFlowContactsQueued', queued_items: number, import_id: string } };

export type PaginatedFlowContactsQueryVariables = Exact<{
  accountId: Scalars['ID'];
  pagination?: InputMaybe<PaginatedFlowContactListOptions>;
  filter?: InputMaybe<FlowContactListFilter>;
}>;


export type PaginatedFlowContactsQuery = { __typename?: 'Query', accountFlowContacts: { __typename?: 'PaginatedFlowContactsList', totalItems: number, items: Array<{ __typename?: 'FlowContact', id: string, first_name: string, last_name: string, email?: string | null, phone: string, status: FlowContactStatus, date_updated?: any | null, date_created: any, segments: Array<{ __typename?: 'FlowContactSegment', id: string, label: string }> }> } };

export type BatchUpdateFlowContactMutationVariables = Exact<{
  input: Array<BatchUpdateFlowContact> | BatchUpdateFlowContact;
}>;


export type BatchUpdateFlowContactMutation = { __typename?: 'Mutation', batchUpdateFlowContact: Array<{ __typename?: 'FlowContact', id: string, first_name: string, last_name: string, email?: string | null, phone: string, status: FlowContactStatus, date_updated?: any | null, date_created: any, segments: Array<{ __typename?: 'FlowContactSegment', id: string, label: string }> }> };

export type ToggleFlowContactInSegmentMutationVariables = Exact<{
  input?: InputMaybe<ToggleFlowContactInSegmentInput>;
}>;


export type ToggleFlowContactInSegmentMutation = { __typename?: 'Mutation', toggleFlowContactInSegment: Array<{ __typename?: 'FlowContact', id: string, first_name: string, last_name: string, email?: string | null, phone: string, status: FlowContactStatus, date_updated?: any | null, date_created: any, segments: Array<{ __typename?: 'FlowContactSegment', id: string, label: string }> }> };

export type FlowRecordingFragment = { __typename?: 'FlowRecording', id: string, duration: number, contact_name: string, contact_phone: string, date_created: any, record: { __typename?: 'Asset', url: string }, flow?: { __typename?: 'Flow', id: string, name: string, type: FlowType, date_updated?: any | null, date_created: any, daily_budget: number, status: FlowStatus } | null };

export type FlowRecordingsQueryVariables = Exact<{
  accountId: Scalars['ID'];
  pagination?: InputMaybe<PaginatedFlowRecordingListOptions>;
  filter?: InputMaybe<FlowRecordingListFilter>;
}>;


export type FlowRecordingsQuery = { __typename?: 'Query', flowRecordings: { __typename?: 'PaginatedFlowRecordingList', totalItems: number, items: Array<{ __typename?: 'FlowRecording', id: string, duration: number, contact_name: string, contact_phone: string, date_created: any, record: { __typename?: 'Asset', url: string }, flow?: { __typename?: 'Flow', id: string, name: string, type: FlowType, date_updated?: any | null, date_created: any, daily_budget: number, status: FlowStatus } | null }> } };

export type FlowFragment = { __typename?: 'Flow', id: string, name: string, type: FlowType, status: FlowStatus, daily_budget: number, segment?: { __typename?: 'FlowContactSegment', id: string, label: string } | null, agent: { __typename?: 'FlowAgent', id: string, title: string, script?: string | null, script_schema?: any | null, script_language?: string | null, voice: FlowAgentVoice, editor_type: FlowAgentEditorType, date_created: any, date_updated?: any | null, knowledge_base?: { __typename?: 'KnowledgeBase', id: string, title: string, type: KnowledgeBaseType, date_created: any, date_updated?: any | null, qa: Array<{ __typename?: 'KnowledgeBaseQA', id: string, question: string, answer: string, date_created: any, date_updated?: any | null, knowledge_base: Array<{ __typename?: 'KnowledgeBase', id: string, title: string }> }> } | null } };

export type CreateFlowMutationVariables = Exact<{
  input: CreateFlowInput;
}>;


export type CreateFlowMutation = { __typename?: 'Mutation', createFlow: { __typename?: 'Flow', id: string, name: string, type: FlowType, status: FlowStatus, daily_budget: number, segment?: { __typename?: 'FlowContactSegment', id: string, label: string } | null, agent: { __typename?: 'FlowAgent', id: string, title: string, script?: string | null, script_schema?: any | null, script_language?: string | null, voice: FlowAgentVoice, editor_type: FlowAgentEditorType, date_created: any, date_updated?: any | null, knowledge_base?: { __typename?: 'KnowledgeBase', id: string, title: string, type: KnowledgeBaseType, date_created: any, date_updated?: any | null, qa: Array<{ __typename?: 'KnowledgeBaseQA', id: string, question: string, answer: string, date_created: any, date_updated?: any | null, knowledge_base: Array<{ __typename?: 'KnowledgeBase', id: string, title: string }> }> } | null } } };

export type UpdateFlowMutationVariables = Exact<{
  input: UpdateFlowInput;
}>;


export type UpdateFlowMutation = { __typename?: 'Mutation', updateFlow: { __typename?: 'Flow', id: string, name: string, type: FlowType, status: FlowStatus, daily_budget: number, segment?: { __typename?: 'FlowContactSegment', id: string, label: string } | null, agent: { __typename?: 'FlowAgent', id: string, title: string, script?: string | null, script_schema?: any | null, script_language?: string | null, voice: FlowAgentVoice, editor_type: FlowAgentEditorType, date_created: any, date_updated?: any | null, knowledge_base?: { __typename?: 'KnowledgeBase', id: string, title: string, type: KnowledgeBaseType, date_created: any, date_updated?: any | null, qa: Array<{ __typename?: 'KnowledgeBaseQA', id: string, question: string, answer: string, date_created: any, date_updated?: any | null, knowledge_base: Array<{ __typename?: 'KnowledgeBase', id: string, title: string }> }> } | null } } };

export type AccountFlowsQueryVariables = Exact<{
  accountId: Scalars['ID'];
}>;


export type AccountFlowsQuery = { __typename?: 'Query', accountFlows: Array<{ __typename?: 'Flow', id: string, name: string, type: FlowType, status: FlowStatus, daily_budget: number, segment?: { __typename?: 'FlowContactSegment', id: string, label: string } | null, agent: { __typename?: 'FlowAgent', id: string, title: string, script?: string | null, script_schema?: any | null, script_language?: string | null, voice: FlowAgentVoice, editor_type: FlowAgentEditorType, date_created: any, date_updated?: any | null, knowledge_base?: { __typename?: 'KnowledgeBase', id: string, title: string, type: KnowledgeBaseType, date_created: any, date_updated?: any | null, qa: Array<{ __typename?: 'KnowledgeBaseQA', id: string, question: string, answer: string, date_created: any, date_updated?: any | null, knowledge_base: Array<{ __typename?: 'KnowledgeBase', id: string, title: string }> }> } | null } }> };

export type AccountFlowQueryVariables = Exact<{
  accountFlowId: Scalars['ID'];
}>;


export type AccountFlowQuery = { __typename?: 'Query', accountFlow?: { __typename?: 'Flow', id: string, name: string, type: FlowType, status: FlowStatus, daily_budget: number, segment?: { __typename?: 'FlowContactSegment', id: string, label: string } | null, agent: { __typename?: 'FlowAgent', id: string, title: string, script?: string | null, script_schema?: any | null, script_language?: string | null, voice: FlowAgentVoice, editor_type: FlowAgentEditorType, date_created: any, date_updated?: any | null, knowledge_base?: { __typename?: 'KnowledgeBase', id: string, title: string, type: KnowledgeBaseType, date_created: any, date_updated?: any | null, qa: Array<{ __typename?: 'KnowledgeBaseQA', id: string, question: string, answer: string, date_created: any, date_updated?: any | null, knowledge_base: Array<{ __typename?: 'KnowledgeBase', id: string, title: string }> }> } | null } } | null };

export type DeleteFlowMutationVariables = Exact<{
  deleteFlowId: Scalars['ID'];
}>;


export type DeleteFlowMutation = { __typename?: 'Mutation', deleteFlow: boolean };

export type KnowledgeBaseQaFragment = { __typename?: 'KnowledgeBaseQA', id: string, question: string, answer: string, date_created: any, date_updated?: any | null, knowledge_base: Array<{ __typename?: 'KnowledgeBase', id: string, title: string }> };

export type KnowledgeBaseWithoutQaFragment = { __typename?: 'KnowledgeBase', id: string, title: string, type: KnowledgeBaseType, date_created: any, date_updated?: any | null };

export type KnowledgeBaseFragment = { __typename?: 'KnowledgeBase', id: string, title: string, type: KnowledgeBaseType, date_created: any, date_updated?: any | null, qa: Array<{ __typename?: 'KnowledgeBaseQA', id: string, question: string, answer: string, date_created: any, date_updated?: any | null, knowledge_base: Array<{ __typename?: 'KnowledgeBase', id: string, title: string }> }> };

export type KnowledgeBaseQaWithBasesFragment = { __typename?: 'KnowledgeBaseQA', id: string, question: string, answer: string, date_created: any, date_updated?: any | null, knowledge_base: Array<{ __typename?: 'KnowledgeBase', id: string, title: string, type: KnowledgeBaseType, date_created: any, date_updated?: any | null }> };

export type CreateKnowledgeBaseMutationVariables = Exact<{
  accountId: Scalars['ID'];
  input: CreateKnowledgeBaseInput;
}>;


export type CreateKnowledgeBaseMutation = { __typename?: 'Mutation', createKnowledgeBase: { __typename?: 'KnowledgeBase', id: string, title: string, type: KnowledgeBaseType, date_created: any, date_updated?: any | null, qa: Array<{ __typename?: 'KnowledgeBaseQA', id: string, question: string, answer: string, date_created: any, date_updated?: any | null, knowledge_base: Array<{ __typename?: 'KnowledgeBase', id: string, title: string }> }> } };

export type KnowledgeBaseQueryVariables = Exact<{
  knowledgeBaseId: Scalars['ID'];
}>;


export type KnowledgeBaseQuery = { __typename?: 'Query', knowledgeBase?: { __typename?: 'KnowledgeBase', id: string, title: string, type: KnowledgeBaseType, date_created: any, date_updated?: any | null, qa: Array<{ __typename?: 'KnowledgeBaseQA', id: string, question: string, answer: string, date_created: any, date_updated?: any | null, knowledge_base: Array<{ __typename?: 'KnowledgeBase', id: string, title: string }> }> } | null };

export type DeleteKnowledgeBaseMutationVariables = Exact<{
  deleteKnowledgeBaseId: Scalars['ID'];
}>;


export type DeleteKnowledgeBaseMutation = { __typename?: 'Mutation', deleteKnowledgeBase: boolean };

export type AccountKnowledgeBasesQueryVariables = Exact<{
  accountId: Scalars['ID'];
}>;


export type AccountKnowledgeBasesQuery = { __typename?: 'Query', accountKnowledgeBases: Array<{ __typename?: 'KnowledgeBase', id: string, title: string, type: KnowledgeBaseType, date_created: any, date_updated?: any | null, qa: Array<{ __typename?: 'KnowledgeBaseQA', id: string, question: string, answer: string, date_created: any, date_updated?: any | null, knowledge_base: Array<{ __typename?: 'KnowledgeBase', id: string, title: string }> }> }> };

export type UpdateKnowledgeMutationVariables = Exact<{
  input: UpdateKnowledgeBaseInput;
}>;


export type UpdateKnowledgeMutation = { __typename?: 'Mutation', updateKnowledge: { __typename?: 'KnowledgeBase', id: string, title: string, type: KnowledgeBaseType, date_created: any, date_updated?: any | null, qa: Array<{ __typename?: 'KnowledgeBaseQA', id: string, question: string, answer: string, date_created: any, date_updated?: any | null, knowledge_base: Array<{ __typename?: 'KnowledgeBase', id: string, title: string }> }> } };

export type CreateKnowledgeBaseQaMutationVariables = Exact<{
  input: Array<CreateKnowledgeBaseQaInput> | CreateKnowledgeBaseQaInput;
}>;


export type CreateKnowledgeBaseQaMutation = { __typename?: 'Mutation', createKnowledgeBaseQA: Array<{ __typename?: 'KnowledgeBaseQA', id: string, question: string, answer: string, date_created: any, date_updated?: any | null, knowledge_base: Array<{ __typename?: 'KnowledgeBase', id: string, title: string, type: KnowledgeBaseType, date_created: any, date_updated?: any | null }> }> };

export type DeleteKnowledgeBaseQaMutationVariables = Exact<{
  deleteKnowledgeBaseQaId: Array<Scalars['ID']> | Scalars['ID'];
}>;


export type DeleteKnowledgeBaseQaMutation = { __typename?: 'Mutation', deleteKnowledgeBaseQA: boolean };

export type UpdateKnowledgeBaseQaMutationVariables = Exact<{
  input: UpdateKnowledgeBaseQaInput;
}>;


export type UpdateKnowledgeBaseQaMutation = { __typename?: 'Mutation', updateKnowledgeBaseQA: { __typename?: 'KnowledgeBaseQA', id: string, question: string, answer: string, date_created: any, date_updated?: any | null, knowledge_base: Array<{ __typename?: 'KnowledgeBase', id: string, title: string, type: KnowledgeBaseType, date_created: any, date_updated?: any | null }> } };

export type KnowledgeBaseQaQueryVariables = Exact<{
  knowledgeBaseQaId: Scalars['ID'];
}>;


export type KnowledgeBaseQaQuery = { __typename?: 'Query', knowledgeBaseQA?: { __typename?: 'KnowledgeBaseQA', id: string, question: string, answer: string, date_created: any, date_updated?: any | null, knowledge_base: Array<{ __typename?: 'KnowledgeBase', id: string, title: string, type: KnowledgeBaseType, date_created: any, date_updated?: any | null }> } | null };

export type AccountAllModulesQueryVariables = Exact<{
  account: Scalars['ID'];
  mode: SoftDeleteQueryMode;
}>;


export type AccountAllModulesQuery = { __typename?: 'Query', accountQuotations: Array<{ __typename?: 'Quotation', id: string, hash: string, date_updated?: any | null, date_created: any, status: QuotationStatus, title: string, questions_count: number, requests_count: number }> };

export type SubscriptionPlanPriceFragment = { __typename?: 'SubscriptionPlanPrice', price: string, currency: CurrencyCode, interval: PlanInterval, external_id: string };

export type SubscriptionPlanFragment = { __typename?: 'SubscriptionPlan', id: string, name: string, benefits?: Array<{ __typename?: 'Translation', language: LanguageCode, value: string } | null> | null, prices: Array<{ __typename?: 'SubscriptionPlanPrice', price: string, currency: CurrencyCode, interval: PlanInterval, external_id: string }> };

export type SubscriptionPlansQueryVariables = Exact<{ [key: string]: never; }>;


export type SubscriptionPlansQuery = { __typename?: 'Query', subscriptionPlans: Array<{ __typename?: 'SubscriptionPlan', id: string, name: string, benefits?: Array<{ __typename?: 'Translation', language: LanguageCode, value: string } | null> | null, prices: Array<{ __typename?: 'SubscriptionPlanPrice', price: string, currency: CurrencyCode, interval: PlanInterval, external_id: string }> }> };

export type CreateSubscriptionCheckoutMutationVariables = Exact<{
  input: CreateSubscriptionCheckoutInput;
}>;


export type CreateSubscriptionCheckoutMutation = { __typename?: 'Mutation', createSubscriptionCheckout: { __typename?: 'CreateSubscriptionCheckoutResult', url: string } };

export type QuotationExhibitionFragment = { __typename?: 'Quotation', id: string, hash: string, date_updated?: any | null, date_created: any, status: QuotationStatus, title: string, questions_count: number, requests_count: number };

export type QuotationWithCountsFragment = { __typename?: 'Quotation', id: string, hash: string, date_updated?: any | null, date_created: any, status: QuotationStatus, title: string, questions_count: number, requests_count: number };

export type QuotationQuestionFragment = { __typename?: 'QuotationQuestion', id: string, label: string, order: number, condition?: string | null, parent?: string | null, quotation: string, active: boolean };

export type QuotationFragment = { __typename?: 'Quotation', id: string, hash: string, title: string, status: QuotationStatus, prompt_instructions?: string | null, date_updated?: any | null, date_created: any, date_deleted?: any | null, questions?: Array<{ __typename?: 'QuotationQuestion', id: string, label: string, order: number, condition?: string | null, parent?: string | null, quotation: string, active: boolean }> | null };

export type QuotationWidgetConfigFragment = { __typename?: 'Quotation', id: string, hash: string, widget_config?: { __typename?: 'WidgetConfig', title?: string | null, width?: string | null, position?: string | null, main_color?: string | null, initially_open?: boolean | null, allowed_domains?: Array<string> | null, hide_powered_by?: boolean | null, height?: string | null, google_font?: string | null, distance_from_border?: number | null, button_text_color?: string | null, button_text?: string | null, button_font_size?: string | null, button_color?: string | null, button_icon_color?: string | null, button_size?: number | null, font_size?: number | null, theme?: WidgetTheme | null, icon?: { __typename?: 'Asset', id: string, url: string } | null, avatar?: { __typename?: 'Asset', id: string, url: string } | null } | null };

export type AssetFragment = { __typename?: 'Asset', id: string, url: string };

export type QuotationConversationFragment = { __typename?: 'QuotationConversation', id: string, recipient?: { __typename?: 'QuotationConversationRecipient', email?: string | null, first_name?: string | null, last_name?: string | null, phone?: string | null } | null };

export type FullQuotationRequestFragment = { __typename?: 'QuotationRequest', id: string, sequential_id: string, date_created: any, date_updated?: any | null, checked_at?: any | null, visualized_at?: any | null, data?: Array<{ __typename?: 'QuotationRequestData', answer: string, question: string }> | null, checked_by?: { __typename?: 'User', id: string, email: string, first_name: string, last_name: string } | null, conversation: { __typename?: 'QuotationConversation', id: string, recipient?: { __typename?: 'QuotationConversationRecipient', email?: string | null, first_name?: string | null, last_name?: string | null, phone?: string | null } | null }, quotation: { __typename?: 'Quotation', id: string, hash: string, title: string, status: QuotationStatus, prompt_instructions?: string | null, date_updated?: any | null, date_created: any, date_deleted?: any | null, questions?: Array<{ __typename?: 'QuotationQuestion', id: string, label: string, order: number, condition?: string | null, parent?: string | null, quotation: string, active: boolean }> | null } };

export type SimpleQuotationRequestFragment = { __typename?: 'QuotationRequest', id: string, sequential_id: string, date_created: any, date_updated?: any | null, checked_at?: any | null, visualized_at?: any | null, quotation: { __typename?: 'Quotation', id: string, hash: string, title: string, status: QuotationStatus, prompt_instructions?: string | null, date_updated?: any | null, date_created: any, date_deleted?: any | null, questions?: Array<{ __typename?: 'QuotationQuestion', id: string, label: string, order: number, condition?: string | null, parent?: string | null, quotation: string, active: boolean }> | null }, conversation: { __typename?: 'QuotationConversation', id: string, recipient?: { __typename?: 'QuotationConversationRecipient', email?: string | null, first_name?: string | null, last_name?: string | null, phone?: string | null } | null } };

export type QuotationMetricsFragment = { __typename?: 'Quotation', id: string, hash: string, title: string, requests_count: number };

export type AccountQuotationsQueryVariables = Exact<{
  account: Scalars['ID'];
  mode: SoftDeleteQueryMode;
}>;


export type AccountQuotationsQuery = { __typename?: 'Query', accountQuotations: Array<{ __typename?: 'Quotation', id: string, hash: string, date_updated?: any | null, date_created: any, status: QuotationStatus, title: string, questions_count: number, requests_count: number }> };

export type CreateQuotationMutationVariables = Exact<{
  input: CreateQuotationInput;
}>;


export type CreateQuotationMutation = { __typename?: 'Mutation', createQuotation: { __typename?: 'Quotation', id: string, hash: string, title: string, status: QuotationStatus, prompt_instructions?: string | null, date_updated?: any | null, date_created: any, date_deleted?: any | null, questions?: Array<{ __typename?: 'QuotationQuestion', id: string, label: string, order: number, condition?: string | null, parent?: string | null, quotation: string, active: boolean }> | null } };

export type UpdateQuotationMutationVariables = Exact<{
  input: UpdateQuotationInput;
}>;


export type UpdateQuotationMutation = { __typename?: 'Mutation', updateQuotation: { __typename?: 'Quotation', id: string, hash: string, title: string, status: QuotationStatus, prompt_instructions?: string | null, date_updated?: any | null, date_created: any, date_deleted?: any | null, questions?: Array<{ __typename?: 'QuotationQuestion', id: string, label: string, order: number, condition?: string | null, parent?: string | null, quotation: string, active: boolean }> | null } };

export type UpdateQuotationWidgetSettingsMutationVariables = Exact<{
  input: UpdateQuotationInput;
}>;


export type UpdateQuotationWidgetSettingsMutation = { __typename?: 'Mutation', updateQuotation: { __typename?: 'Quotation', id: string, hash: string, widget_config?: { __typename?: 'WidgetConfig', title?: string | null, width?: string | null, position?: string | null, main_color?: string | null, initially_open?: boolean | null, allowed_domains?: Array<string> | null, hide_powered_by?: boolean | null, height?: string | null, google_font?: string | null, distance_from_border?: number | null, button_text_color?: string | null, button_text?: string | null, button_font_size?: string | null, button_color?: string | null, button_icon_color?: string | null, button_size?: number | null, font_size?: number | null, theme?: WidgetTheme | null, icon?: { __typename?: 'Asset', id: string, url: string } | null, avatar?: { __typename?: 'Asset', id: string, url: string } | null } | null } };

export type CreateQuotationQuestionMutationVariables = Exact<{
  input: Array<CreateQuotationQuestionInput> | CreateQuotationQuestionInput;
}>;


export type CreateQuotationQuestionMutation = { __typename?: 'Mutation', createQuotationQuestion: Array<{ __typename?: 'QuotationQuestion', id: string, label: string, order: number, condition?: string | null, parent?: string | null, quotation: string, active: boolean }> };

export type DeleteQuotationMutationVariables = Exact<{
  deleteQuotationId: Scalars['ID'];
}>;


export type DeleteQuotationMutation = { __typename?: 'Mutation', deleteQuotation: boolean };

export type AccountQuotationQueryVariables = Exact<{
  accountQuotationId: Scalars['ID'];
}>;


export type AccountQuotationQuery = { __typename?: 'Query', accountQuotation?: { __typename?: 'Quotation', id: string, hash: string, title: string, status: QuotationStatus, prompt_instructions?: string | null, date_updated?: any | null, date_created: any, date_deleted?: any | null, questions?: Array<{ __typename?: 'QuotationQuestion', id: string, label: string, order: number, condition?: string | null, parent?: string | null, quotation: string, active: boolean }> | null } | null };

export type AccountQuotationMetricsQueryVariables = Exact<{
  accountQuotationId: Scalars['ID'];
}>;


export type AccountQuotationMetricsQuery = { __typename?: 'Query', accountQuotation?: { __typename?: 'Quotation', id: string, hash: string, title: string, requests_count: number } | null };

export type AccountQuotationWidgetSettingsQueryVariables = Exact<{
  accountQuotationId: Scalars['ID'];
}>;


export type AccountQuotationWidgetSettingsQuery = { __typename?: 'Query', accountQuotation?: { __typename?: 'Quotation', id: string, hash: string, widget_config?: { __typename?: 'WidgetConfig', title?: string | null, width?: string | null, position?: string | null, main_color?: string | null, initially_open?: boolean | null, allowed_domains?: Array<string> | null, hide_powered_by?: boolean | null, height?: string | null, google_font?: string | null, distance_from_border?: number | null, button_text_color?: string | null, button_text?: string | null, button_font_size?: string | null, button_color?: string | null, button_icon_color?: string | null, button_size?: number | null, font_size?: number | null, theme?: WidgetTheme | null, icon?: { __typename?: 'Asset', id: string, url: string } | null, avatar?: { __typename?: 'Asset', id: string, url: string } | null } | null } | null };

export type DeleteQuotationQuestionMutationVariables = Exact<{
  deleteQuotationQuestionId: Scalars['ID'];
}>;


export type DeleteQuotationQuestionMutation = { __typename?: 'Mutation', deleteQuotationQuestion: boolean };

export type UpdateQuotationQuestionMutationVariables = Exact<{
  input: UpdateQuotationQuestionInput;
}>;


export type UpdateQuotationQuestionMutation = { __typename?: 'Mutation', updateQuotationQuestion: { __typename?: 'QuotationQuestion', id: string } };

export type UploadFileMutationVariables = Exact<{
  file: Scalars['Upload'];
}>;


export type UploadFileMutation = { __typename?: 'Mutation', uploadFile: Array<{ __typename?: 'Asset', id: string, url: string }> };

export type QuotationModelBySegmentQueryVariables = Exact<{
  segmentId: Scalars['ID'];
}>;


export type QuotationModelBySegmentQuery = { __typename?: 'Query', quotationModelBySegment?: { __typename?: 'Quotation', id: string, hash: string, title: string, status: QuotationStatus, prompt_instructions?: string | null, date_updated?: any | null, date_created: any, date_deleted?: any | null, questions?: Array<{ __typename?: 'QuotationQuestion', id: string, label: string, order: number, condition?: string | null, parent?: string | null, quotation: string, active: boolean }> | null } | null };

export type AccountQuotationRequestsQueryVariables = Exact<{
  accountId: Scalars['ID'];
  pagination?: InputMaybe<PaginatedQuotationRequestListOptions>;
  filter?: InputMaybe<QuotationRequestFilter>;
}>;


export type AccountQuotationRequestsQuery = { __typename?: 'Query', accountQuotationRequests: { __typename?: 'PaginatedQuotationRequestList', totalItems: number, items: Array<{ __typename?: 'QuotationRequest', id: string, sequential_id: string, date_created: any, date_updated?: any | null, checked_at?: any | null, visualized_at?: any | null, quotation: { __typename?: 'Quotation', id: string, hash: string, title: string, status: QuotationStatus, prompt_instructions?: string | null, date_updated?: any | null, date_created: any, date_deleted?: any | null, questions?: Array<{ __typename?: 'QuotationQuestion', id: string, label: string, order: number, condition?: string | null, parent?: string | null, quotation: string, active: boolean }> | null }, conversation: { __typename?: 'QuotationConversation', id: string, recipient?: { __typename?: 'QuotationConversationRecipient', email?: string | null, first_name?: string | null, last_name?: string | null, phone?: string | null } | null } }> } };

export type AccountQuotationRequestQueryVariables = Exact<{
  quotationId: Scalars['ID'];
  requestSequentialId: Scalars['ID'];
}>;


export type AccountQuotationRequestQuery = { __typename?: 'Query', accountQuotationRequest?: { __typename?: 'QuotationRequest', id: string, sequential_id: string, date_created: any, date_updated?: any | null, checked_at?: any | null, visualized_at?: any | null, data?: Array<{ __typename?: 'QuotationRequestData', answer: string, question: string }> | null, checked_by?: { __typename?: 'User', id: string, email: string, first_name: string, last_name: string } | null, conversation: { __typename?: 'QuotationConversation', id: string, recipient?: { __typename?: 'QuotationConversationRecipient', email?: string | null, first_name?: string | null, last_name?: string | null, phone?: string | null } | null }, quotation: { __typename?: 'Quotation', id: string, hash: string, title: string, status: QuotationStatus, prompt_instructions?: string | null, date_updated?: any | null, date_created: any, date_deleted?: any | null, questions?: Array<{ __typename?: 'QuotationQuestion', id: string, label: string, order: number, condition?: string | null, parent?: string | null, quotation: string, active: boolean }> | null } } | null };

export type VisualizeQuotationRequestMutationVariables = Exact<{
  requestId: Array<Scalars['ID']> | Scalars['ID'];
}>;


export type VisualizeQuotationRequestMutation = { __typename?: 'Mutation', visualizeQuotationRequest?: boolean | null };

export type ToggleQuotationRequestCheckMutationVariables = Exact<{
  requestId: Array<Scalars['ID']> | Scalars['ID'];
}>;


export type ToggleQuotationRequestCheckMutation = { __typename?: 'Mutation', toggleQuotationRequestCheck: Array<{ __typename?: 'QuotationRequest', id: string, sequential_id: string, date_created: any, date_updated?: any | null, checked_at?: any | null, visualized_at?: any | null, data?: Array<{ __typename?: 'QuotationRequestData', answer: string, question: string }> | null, checked_by?: { __typename?: 'User', id: string, email: string, first_name: string, last_name: string } | null, conversation: { __typename?: 'QuotationConversation', id: string, recipient?: { __typename?: 'QuotationConversationRecipient', email?: string | null, first_name?: string | null, last_name?: string | null, phone?: string | null } | null }, quotation: { __typename?: 'Quotation', id: string, hash: string, title: string, status: QuotationStatus, prompt_instructions?: string | null, date_updated?: any | null, date_created: any, date_deleted?: any | null, questions?: Array<{ __typename?: 'QuotationQuestion', id: string, label: string, order: number, condition?: string | null, parent?: string | null, quotation: string, active: boolean }> | null } }> };

export type SegmentFragment = { __typename?: 'Segment', id: string, title: string, translations: Array<{ __typename?: 'Translation', language: LanguageCode, value: string }> };

export type UpdateAccountWidgetConfigMutationVariables = Exact<{
  accountId: Scalars['ID'];
  input: WidgetConfigInput;
}>;


export type UpdateAccountWidgetConfigMutation = { __typename?: 'Mutation', updateAccountWidgetConfig?: { __typename?: 'WidgetConfig', title?: string | null, width?: string | null, position?: string | null, main_color?: string | null, initially_open?: boolean | null, allowed_domains?: Array<string> | null, hide_powered_by?: boolean | null, height?: string | null, google_font?: string | null, distance_from_border?: number | null, button_text_color?: string | null, button_text?: string | null, button_font_size?: string | null, button_color?: string | null, button_icon_color?: string | null, button_size?: number | null, font_size?: number | null, theme?: WidgetTheme | null, icon?: { __typename?: 'Asset', id: string, url: string } | null, avatar?: { __typename?: 'Asset', id: string, url: string } | null } | null };

export type AccountSettingsQueryVariables = Exact<{
  accountId: Scalars['ID'];
}>;


export type AccountSettingsQuery = { __typename?: 'Query', accountWidgetSettings?: { __typename?: 'WidgetConfig', title?: string | null, width?: string | null, position?: string | null, main_color?: string | null, initially_open?: boolean | null, allowed_domains?: Array<string> | null, hide_powered_by?: boolean | null, height?: string | null, google_font?: string | null, distance_from_border?: number | null, button_text_color?: string | null, button_text?: string | null, button_font_size?: string | null, button_color?: string | null, button_icon_color?: string | null, button_size?: number | null, font_size?: number | null, theme?: WidgetTheme | null, icon?: { __typename?: 'Asset', id: string, url: string } | null, avatar?: { __typename?: 'Asset', id: string, url: string } | null } | null };

export type UpdateAccountSettingsMutationVariables = Exact<{
  input: UpdateAccountSettingsInput;
}>;


export type UpdateAccountSettingsMutation = { __typename?: 'Mutation', updateAccountSettings?: { __typename?: 'Account', id: string, name: string, description?: string | null, website?: string | null, currency?: CurrencyCode | null, segment?: { __typename?: 'Segment', id: string, title: string, translations: Array<{ __typename?: 'Translation', language: LanguageCode, value: string }> } | null, active_subscription?: { __typename?: 'AccountSubscription', id: string, status: SubscriptionStatus } | null, concluded_onboarding_steps: Array<{ __typename?: 'OnBoardingStep', id: string, name: OnBoardingStepName, date_created: string }> } | null };

export type AvailableSegmentsQueryVariables = Exact<{ [key: string]: never; }>;


export type AvailableSegmentsQuery = { __typename?: 'Query', availableSegments: Array<{ __typename?: 'Segment', id: string, title: string, translations: Array<{ __typename?: 'Translation', language: LanguageCode, value: string }> }> };

export type WidgetConfigFragment = { __typename?: 'WidgetConfig', title?: string | null, width?: string | null, position?: string | null, main_color?: string | null, initially_open?: boolean | null, allowed_domains?: Array<string> | null, hide_powered_by?: boolean | null, height?: string | null, google_font?: string | null, distance_from_border?: number | null, button_text_color?: string | null, button_text?: string | null, button_font_size?: string | null, button_color?: string | null, button_icon_color?: string | null, button_size?: number | null, font_size?: number | null, theme?: WidgetTheme | null, icon?: { __typename?: 'Asset', id: string, url: string } | null, avatar?: { __typename?: 'Asset', id: string, url: string } | null };

export type UserFragment = { __typename?: 'User', id: string, email: string, first_name: string, last_name: string };

export type AccountFragment = { __typename?: 'Account', id: string, name: string, description?: string | null, website?: string | null, currency?: CurrencyCode | null, segment?: { __typename?: 'Segment', id: string, title: string, translations: Array<{ __typename?: 'Translation', language: LanguageCode, value: string }> } | null, active_subscription?: { __typename?: 'AccountSubscription', id: string, status: SubscriptionStatus } | null, concluded_onboarding_steps: Array<{ __typename?: 'OnBoardingStep', id: string, name: OnBoardingStepName, date_created: string }> };

export type UserAccountFragment = { __typename?: 'UserAccount', role: AccountRole, allowed_modules: Array<AccountUsageKind>, account: { __typename?: 'Account', id: string, name: string, description?: string | null, website?: string | null, currency?: CurrencyCode | null, segment?: { __typename?: 'Segment', id: string, title: string, translations: Array<{ __typename?: 'Translation', language: LanguageCode, value: string }> } | null, active_subscription?: { __typename?: 'AccountSubscription', id: string, status: SubscriptionStatus } | null, concluded_onboarding_steps: Array<{ __typename?: 'OnBoardingStep', id: string, name: OnBoardingStepName, date_created: string }> } };

export type ActiveUserFragment = { __typename?: 'ActiveUser', id: string, email: string, last_login?: any | null, is_affiliate?: boolean | null, first_name: string, last_name: string, anonymous_id?: string | null, permissions: Array<Permissions>, language?: LanguageCode | null, accounts: Array<{ __typename?: 'UserAccount', role: AccountRole, allowed_modules: Array<AccountUsageKind>, account: { __typename?: 'Account', id: string, name: string, description?: string | null, website?: string | null, currency?: CurrencyCode | null, segment?: { __typename?: 'Segment', id: string, title: string, translations: Array<{ __typename?: 'Translation', language: LanguageCode, value: string }> } | null, active_subscription?: { __typename?: 'AccountSubscription', id: string, status: SubscriptionStatus } | null, concluded_onboarding_steps: Array<{ __typename?: 'OnBoardingStep', id: string, name: OnBoardingStepName, date_created: string }> } }> };

export type MenuUserPermissionsFragment = { __typename?: 'ActiveUser', is_affiliate?: boolean | null, permissions: Array<Permissions>, accounts: Array<{ __typename?: 'UserAccount', role: AccountRole, allowed_modules: Array<AccountUsageKind>, account: { __typename?: 'Account', id: string, currency?: CurrencyCode | null, active_subscription?: { __typename?: 'AccountSubscription', status: SubscriptionStatus } | null } }> };

export type LoginUserMutationVariables = Exact<{
  input: LoginUserInput;
}>;


export type LoginUserMutation = { __typename?: 'Mutation', loginUser: { __typename?: 'ActiveUser', id: string, email: string, last_login?: any | null, is_affiliate?: boolean | null, first_name: string, last_name: string, anonymous_id?: string | null, permissions: Array<Permissions>, language?: LanguageCode | null, accounts: Array<{ __typename?: 'UserAccount', role: AccountRole, allowed_modules: Array<AccountUsageKind>, account: { __typename?: 'Account', id: string, name: string, description?: string | null, website?: string | null, currency?: CurrencyCode | null, segment?: { __typename?: 'Segment', id: string, title: string, translations: Array<{ __typename?: 'Translation', language: LanguageCode, value: string }> } | null, active_subscription?: { __typename?: 'AccountSubscription', id: string, status: SubscriptionStatus } | null, concluded_onboarding_steps: Array<{ __typename?: 'OnBoardingStep', id: string, name: OnBoardingStepName, date_created: string }> } }> } | { __typename?: 'UserAuthError', errorCode: UserAuthErrorCode, message: string } };

export type ActiveUserQueryVariables = Exact<{ [key: string]: never; }>;


export type ActiveUserQuery = { __typename?: 'Query', activeUser?: { __typename?: 'ActiveUser', id: string, email: string, last_login?: any | null, is_affiliate?: boolean | null, first_name: string, last_name: string, anonymous_id?: string | null, permissions: Array<Permissions>, language?: LanguageCode | null, accounts: Array<{ __typename?: 'UserAccount', role: AccountRole, allowed_modules: Array<AccountUsageKind>, account: { __typename?: 'Account', id: string, name: string, description?: string | null, website?: string | null, currency?: CurrencyCode | null, segment?: { __typename?: 'Segment', id: string, title: string, translations: Array<{ __typename?: 'Translation', language: LanguageCode, value: string }> } | null, active_subscription?: { __typename?: 'AccountSubscription', id: string, status: SubscriptionStatus } | null, concluded_onboarding_steps: Array<{ __typename?: 'OnBoardingStep', id: string, name: OnBoardingStepName, date_created: string }> } }> } | null };

export type MenuUserPermissionsQueryVariables = Exact<{ [key: string]: never; }>;


export type MenuUserPermissionsQuery = { __typename?: 'Query', activeUser?: { __typename?: 'ActiveUser', is_affiliate?: boolean | null, permissions: Array<Permissions>, accounts: Array<{ __typename?: 'UserAccount', role: AccountRole, allowed_modules: Array<AccountUsageKind>, account: { __typename?: 'Account', id: string, currency?: CurrencyCode | null, active_subscription?: { __typename?: 'AccountSubscription', status: SubscriptionStatus } | null } }> } | null };

export type RegisterUserMutationVariables = Exact<{
  input: RegisterUserInput;
}>;


export type RegisterUserMutation = { __typename?: 'Mutation', registerUser: { __typename?: 'UserAuthError', errorCode: UserAuthErrorCode, message: string } | { __typename?: 'UserRegistered', created_id: string, should_verify_email: boolean } };

export type LogoutUserMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutUserMutation = { __typename?: 'Mutation', logoutUser: boolean };

export type RequestUserEmailVerificationMutationVariables = Exact<{
  requestUserEmailVerificationId: Scalars['String'];
}>;


export type RequestUserEmailVerificationMutation = { __typename?: 'Mutation', requestUserEmailVerification: boolean };

export type VerifyUserEmailMutationVariables = Exact<{
  verifyUserEmailId: Scalars['String'];
  token: Scalars['String'];
}>;


export type VerifyUserEmailMutation = { __typename?: 'Mutation', verifyUserEmail: { __typename?: 'ActiveUser', id: string, email: string, last_login?: any | null, is_affiliate?: boolean | null, first_name: string, last_name: string, anonymous_id?: string | null, permissions: Array<Permissions>, language?: LanguageCode | null, accounts: Array<{ __typename?: 'UserAccount', role: AccountRole, allowed_modules: Array<AccountUsageKind>, account: { __typename?: 'Account', id: string, name: string, description?: string | null, website?: string | null, currency?: CurrencyCode | null, segment?: { __typename?: 'Segment', id: string, title: string, translations: Array<{ __typename?: 'Translation', language: LanguageCode, value: string }> } | null, active_subscription?: { __typename?: 'AccountSubscription', id: string, status: SubscriptionStatus } | null, concluded_onboarding_steps: Array<{ __typename?: 'OnBoardingStep', id: string, name: OnBoardingStepName, date_created: string }> } }> } | { __typename?: 'VerifyUserEmailError', errorCode?: VerifyUserEmailErrorCode | null, message: string } };

export type RequestUserPasswordResetMutationVariables = Exact<{
  email: Scalars['String'];
}>;


export type RequestUserPasswordResetMutation = { __typename?: 'Mutation', requestUserPasswordReset: boolean };

export type ResetUserPasswordMutationVariables = Exact<{
  input: ResetUserPasswordInput;
}>;


export type ResetUserPasswordMutation = { __typename?: 'Mutation', resetUserPassword: { __typename?: 'ActiveUser', id: string, email: string, last_login?: any | null, is_affiliate?: boolean | null, first_name: string, last_name: string, anonymous_id?: string | null, permissions: Array<Permissions>, language?: LanguageCode | null, accounts: Array<{ __typename?: 'UserAccount', role: AccountRole, allowed_modules: Array<AccountUsageKind>, account: { __typename?: 'Account', id: string, name: string, description?: string | null, website?: string | null, currency?: CurrencyCode | null, segment?: { __typename?: 'Segment', id: string, title: string, translations: Array<{ __typename?: 'Translation', language: LanguageCode, value: string }> } | null, active_subscription?: { __typename?: 'AccountSubscription', id: string, status: SubscriptionStatus } | null, concluded_onboarding_steps: Array<{ __typename?: 'OnBoardingStep', id: string, name: OnBoardingStepName, date_created: string }> } }> } | { __typename?: 'VerifyUserEmailError', errorCode?: VerifyUserEmailErrorCode | null, message: string } };

export type OnBoardingStepFragment = { __typename?: 'OnBoardingStep', id: string, name: OnBoardingStepName, date_created: string };

export type RegisterOnboardingStepForAccountMutationVariables = Exact<{
  accountId: Scalars['ID'];
  step: OnBoardingStepName;
}>;


export type RegisterOnboardingStepForAccountMutation = { __typename?: 'Mutation', registerOnboardingStepForAccount?: { __typename?: 'OnBoardingStep', id: string, name: OnBoardingStepName, date_created: string } | null };

export type UpdateUserMutationVariables = Exact<{
  input: UpdateUserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'ActiveUser', id: string, email: string, last_login?: any | null, is_affiliate?: boolean | null, first_name: string, last_name: string, anonymous_id?: string | null, permissions: Array<Permissions>, language?: LanguageCode | null, accounts: Array<{ __typename?: 'UserAccount', role: AccountRole, allowed_modules: Array<AccountUsageKind>, account: { __typename?: 'Account', id: string, name: string, description?: string | null, website?: string | null, currency?: CurrencyCode | null, segment?: { __typename?: 'Segment', id: string, title: string, translations: Array<{ __typename?: 'Translation', language: LanguageCode, value: string }> } | null, active_subscription?: { __typename?: 'AccountSubscription', id: string, status: SubscriptionStatus } | null, concluded_onboarding_steps: Array<{ __typename?: 'OnBoardingStep', id: string, name: OnBoardingStepName, date_created: string }> } }> } | { __typename?: 'UserAuthError', errorCode: UserAuthErrorCode, message: string } };
