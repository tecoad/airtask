export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string | number;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  File: any;
  JSON: any;
  Upload: any;
};

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

export enum FilterOperator {
  And = 'and',
  Or = 'or'
}

export enum LanguageCode {
  En = 'en',
  Pt = 'pt'
}

export type Mutation = {
  __typename?: 'Mutation';
  exitSimulationMode?: Maybe<Scalars['Boolean']>;
  startSimulationMode?: Maybe<User>;
  uploadFile: Array<Asset>;
};


export type MutationStartSimulationModeArgs = {
  focusUserId: Scalars['ID'];
};


export type MutationUploadFileArgs = {
  file: Scalars['Upload'];
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

export type PaginatedUsersList = {
  __typename?: 'PaginatedUsersList';
  items: Array<User>;
  totalItems: Scalars['Int'];
};

export type PaginatedUsersListOptions = {
  skip?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<UsersListSort>;
  take?: InputMaybe<Scalars['Int']>;
};

export enum Permissions {
  ListUsers = 'ListUsers',
  SuperAdmin = 'SuperAdmin'
}

export type PublicQuotation = {
  __typename?: 'PublicQuotation';
  hash: Scalars['String'];
  title: Scalars['String'];
  widget_config?: Maybe<WidgetConfig>;
};

export type Query = {
  __typename?: 'Query';
  users: PaginatedUsersList;
};


export type QueryUsersArgs = {
  filter?: InputMaybe<UsersListFilter>;
  pagination?: InputMaybe<PaginatedUsersListOptions>;
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

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc'
}

export type Translation = {
  __typename?: 'Translation';
  language: LanguageCode;
  value: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  anonymous_id?: Maybe<Scalars['String']>;
  date_created: Scalars['DateTime'];
  date_updated?: Maybe<Scalars['DateTime']>;
  email: Scalars['String'];
  first_name: Scalars['String'];
  id: Scalars['ID'];
  last_login?: Maybe<Scalars['DateTime']>;
  last_name: Scalars['String'];
};

export type UsersListFilter = {
  /** Filter by first_name, last_name, email, or anonymous_id */
  mainQuery?: InputMaybe<Scalars['String']>;
  operator: FilterOperator;
};

export type UsersListSort = {
  date_created?: InputMaybe<SortOrder>;
  date_updated?: InputMaybe<SortOrder>;
};

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

export enum WidgetTheme {
  Both = 'both',
  Dark = 'dark',
  Light = 'light'
}

export type StartSimulationModeMutationVariables = Exact<{
  focusUserId: Scalars['ID'];
}>;


export type StartSimulationModeMutation = { __typename?: 'Mutation', startSimulationMode?: { __typename?: 'User', id: string | number } | null };

export type WidgetConfigFragment = { __typename?: 'WidgetConfig', title?: string | null, width?: string | null, position?: string | null, main_color?: string | null, initially_open?: boolean | null, allowed_domains?: Array<string> | null, hide_powered_by?: boolean | null, height?: string | null, google_font?: string | null, distance_from_border?: number | null, button_text_color?: string | null, button_text?: string | null, button_font_size?: string | null, button_color?: string | null, button_icon_color?: string | null, button_size?: number | null, font_size?: number | null, icon?: { __typename?: 'Asset', id: string | number, url: string } | null, avatar?: { __typename?: 'Asset', id: string | number, url: string } | null };

export type AssetFragment = { __typename?: 'Asset', id: string | number, title: string, url: string, height?: number | null, width?: number | null, type: string, filesize: string, duration?: number | null };
