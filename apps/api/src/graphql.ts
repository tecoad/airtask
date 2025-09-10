
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum OnBoardingStepName {
    finish_setup_account = "finish_setup_account",
    create_first_quotation = "create_first_quotation",
    first_quotation_copy_link = "first_quotation_copy_link",
    receive_first_quotation_request = "receive_first_quotation_request",
    setup_widget_settings = "setup_widget_settings"
}

export enum AffiliateComissionStatus {
    pending = "pending",
    paid = "paid"
}

export enum AffiliateSettingsResultErrorCode {
    INVALID_PASSWORD = "INVALID_PASSWORD"
}

export enum AffiliateStatus {
    active = "active",
    inactive = "inactive",
    waiting_approval = "waiting_approval"
}

export enum AffiliatePayoutMethod {
    pix = "pix",
    paypal = "paypal"
}

export enum DebugInteractionErrorCode {
    INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS"
}

export enum FlowAgentVoice {
    male = "male",
    female = "female"
}

export enum FlowAgentEditorType {
    form = "form",
    standard = "standard",
    advanced = "advanced"
}

export enum FlowCalendarIntegrationType {
    savvycall = "savvycall"
}

export enum FlowContactStatus {
    active = "active",
    inactive = "inactive"
}

export enum ImportFlowContactsErrorCode {
    INVALID_FILE_FORMAT = "INVALID_FILE_FORMAT",
    INVALID_CSV_COLUMNS_STRUCTURE = "INVALID_CSV_COLUMNS_STRUCTURE",
    NO_ITEMS_FOUND = "NO_ITEMS_FOUND"
}

export enum ToggleFlowContactInSegmentMode {
    ADD = "ADD",
    REMOVE = "REMOVE"
}

export enum FlowStatus {
    active = "active",
    paused = "paused",
    stopped = "stopped"
}

export enum FlowType {
    inbound = "inbound",
    outbound = "outbound"
}

export enum KnowledgeBaseType {
    qa = "qa"
}

export enum SoftDeleteQueryMode {
    show_all = "show_all",
    show_only_not_deleted = "show_only_not_deleted",
    show_only_deleted = "show_only_deleted"
}

export enum QuotationStatus {
    published = "published",
    archived = "archived"
}

export enum AccountUsageKind {
    quotation = "quotation",
    flow = "flow"
}

export enum CreditTransactionType {
    credit = "credit",
    debit = "debit"
}

export enum CreditTransactionReason {
    module_usage = "module_usage",
    plan_creation = "plan_creation",
    plan_renewal = "plan_renewal",
    plan_change = "plan_change",
    plan_cancellation = "plan_cancellation",
    credit_buy = "credit_buy"
}

export enum PlanInterval {
    month = "month",
    year = "year"
}

export enum AccountRole {
    owner = "owner",
    user = "user"
}

export enum SubscriptionStatus {
    active = "active",
    trialing = "trialing",
    pending = "pending",
    cancelled = "cancelled"
}

export enum UserAuthErrorCode {
    EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS",
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED"
}

export enum ResetUserPasswordErrorCode {
    INVALID_TOKEN = "INVALID_TOKEN",
    EXPIRED_TOKEN = "EXPIRED_TOKEN"
}

export enum VerifyUserEmailErrorCode {
    INVALID_TOKEN = "INVALID_TOKEN",
    EXPIRED_TOKEN = "EXPIRED_TOKEN"
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

export interface CreateAccountApiKeyInput {
    accountId: string;
    name?: Nullable<string>;
}

export interface UpdateAccountSettingsInput {
    id: string;
    name?: Nullable<string>;
    description?: Nullable<string>;
    segment?: Nullable<string>;
    website?: Nullable<string>;
}

export interface WidgetConfigInput {
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
    icon?: Nullable<string>;
    avatar?: Nullable<string>;
}

export interface AffiliateComissionsListFilter {
    operator: FilterOperator;
    status?: Nullable<AffiliateComissionStatus>;
}

export interface AffiliateComissionListSort {
    date_created?: Nullable<SortOrder>;
    amount?: Nullable<SortOrder>;
}

export interface PaginatedAffiliateComissionListOptions {
    take?: Nullable<number>;
    skip?: Nullable<number>;
    sort?: Nullable<AffiliateComissionListSort>;
}

export interface CreateUserAffiliateInput {
    alias: string;
    payout_method: AffiliatePayoutMethod;
    payout_method_key: string;
    password: string;
}

export interface UpdateUserAffiliateInput {
    alias?: Nullable<string>;
    payout_method?: Nullable<AffiliatePayoutMethod>;
    payout_method_key?: Nullable<string>;
    password: string;
}

export interface CreateExtraCreditCheckoutInput {
    accountId: string;
    priceExternalId: string;
}

export interface CreateDebugInteractionInput {
    agentId: string;
    phoneNumber: string;
    prospectName: string;
    debugAsInbound: boolean;
}

export interface CreateFlowAgentInput {
    account: string;
    title: string;
    voice: FlowAgentVoice;
    editor_type: FlowAgentEditorType;
    script?: Nullable<string>;
    script_schema?: Nullable<JSON>;
    script_language?: Nullable<string>;
    knowledge_base?: Nullable<string>;
}

export interface UpdateFlowAgentInput {
    id: string;
    title?: Nullable<string>;
    voice?: Nullable<FlowAgentVoice>;
    editor_type?: Nullable<FlowAgentEditorType>;
    script?: Nullable<string>;
    script_schema?: Nullable<JSON>;
    script_language?: Nullable<string>;
    knowledge_base?: Nullable<string>;
}

export interface CreateFlowCalendarIntegrationInput {
    name: string;
    account: string;
    settings: JSON;
}

export interface FlowContactListSort {
    date_created?: Nullable<SortOrder>;
}

export interface PaginatedFlowContactListOptions {
    take?: Nullable<number>;
    skip?: Nullable<number>;
    sort?: Nullable<FlowContactListSort>;
}

export interface FlowContactListFilter {
    operator: FilterOperator;
    status?: Nullable<FlowContactStatus>;
    segment?: Nullable<string>;
    search?: Nullable<string>;
}

export interface ImportFlowContactsFromCsvInput {
    account: string;
    segment: string;
}

export interface ToggleFlowContactInSegmentInput {
    contactId: string[];
    segmentId: string;
    mode: ToggleFlowContactInSegmentMode;
}

export interface BatchUpdateFlowContact {
    id: string;
    status?: Nullable<FlowContactStatus>;
}

export interface FlowRecordingListSort {
    date_created?: Nullable<SortOrder>;
}

export interface PaginatedFlowRecordingListOptions {
    take?: Nullable<number>;
    skip?: Nullable<number>;
    sort?: Nullable<FlowRecordingListSort>;
}

export interface FlowRecordingListFilter {
    operator: FilterOperator;
    contact_search?: Nullable<string>;
    flow?: Nullable<string>;
    duration?: Nullable<NumberFilter>;
    date_created?: Nullable<DateTimeFilter>;
}

export interface CreateFlowContactSegmentInput {
    account: string;
    label: string;
}

export interface UpdateFlowContactSegmentInput {
    id: string;
    label?: Nullable<string>;
}

export interface CreateFlowInput {
    account: string;
    name: string;
    type: FlowType;
    agent: string;
    segment?: Nullable<string>;
    status: FlowStatus;
    daily_budget: number;
}

export interface UpdateFlowInput {
    id: string;
    name?: Nullable<string>;
    agent?: Nullable<string>;
    segment?: Nullable<string>;
    status?: Nullable<FlowStatus>;
    daily_budget?: Nullable<number>;
}

export interface CreateKnowledgeBaseInput {
    title: string;
    type: KnowledgeBaseType;
}

export interface CreateKnowledgeBaseQAInput {
    knowledge_base_id: string[];
    question: string;
    answer: string;
}

export interface UpdateKnowledgeBaseQAInput {
    id: string;
    knowledge_base_id?: Nullable<string[]>;
    question?: Nullable<string>;
    answer?: Nullable<string>;
}

export interface UpdateKnowledgeBaseInput {
    id: string;
    title?: Nullable<string>;
    type?: Nullable<KnowledgeBaseType>;
}

export interface QuotationRequestSearch {
    date_created?: Nullable<SortOrder>;
    date_updated?: Nullable<SortOrder>;
}

export interface PaginatedQuotationRequestListOptions {
    take?: Nullable<number>;
    skip?: Nullable<number>;
    sort?: Nullable<QuotationRequestSearch>;
}

export interface QuotationRequestFilter {
    operator: FilterOperator;
    quotation?: Nullable<string>;
    recipientQuery?: Nullable<string>;
    is_checked?: Nullable<boolean>;
}

export interface CreateQuotationInput {
    title: string;
    prompt_instructions?: Nullable<string>;
    status: QuotationStatus;
    account: string;
}

export interface CreateQuotationQuestionInput {
    quotation: string;
    label: string;
    order: number;
    children?: Nullable<CreateQuotationQuestionChildrenInput[]>;
    parent?: Nullable<string>;
    condition?: Nullable<string>;
    active: boolean;
}

export interface CreateQuotationQuestionChildrenInput {
    label: string;
    condition: string;
    order: number;
    children?: Nullable<CreateQuotationQuestionChildrenInput[]>;
}

export interface UpdateQuotationInput {
    id: string;
    title?: Nullable<string>;
    data_structure?: Nullable<JSON>;
    status?: Nullable<QuotationStatus>;
    prompt_instructions?: Nullable<string>;
    widget_config?: Nullable<WidgetConfigInput>;
}

export interface UpdateQuotationQuestionInput {
    id: string;
    label?: Nullable<string>;
    order?: Nullable<number>;
    condition?: Nullable<string>;
    parent?: Nullable<string>;
    active?: Nullable<boolean>;
}

export interface CreateSubscriptionCheckoutInput {
    accountId: string;
    priceExternalId: string;
}

export interface SubscriptionPortalInput {
    accountId: string;
}

export interface LoginUserInput {
    email: string;
    password: string;
}

export interface RegisterUserInput {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    referrer?: Nullable<string>;
    language?: Nullable<LanguageCode>;
}

export interface ResetUserPasswordInput {
    token: string;
    password: string;
}

export interface UpdateUserInput {
    first_name?: Nullable<string>;
    last_name?: Nullable<string>;
    email?: Nullable<string>;
    language?: Nullable<LanguageCode>;
    old_password?: Nullable<string>;
    password?: Nullable<string>;
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

export interface IQuery {
    accountWidgetSettings(accountId: string): Nullable<WidgetConfig> | Promise<Nullable<WidgetConfig>>;
    account(id: string): Nullable<Account> | Promise<Nullable<Account>>;
    accountApiKeys(accountId: string): AccountApiKey[] | Promise<AccountApiKey[]>;
    affiliateComissions(pagination?: Nullable<PaginatedAffiliateComissionListOptions>, filter?: Nullable<AffiliateComissionsListFilter>): Nullable<PaginatedAffiliateComissionList> | Promise<Nullable<PaginatedAffiliateComissionList>>;
    affiliateComissionsCalcs(): AffiliateComissionsCalcs | Promise<AffiliateComissionsCalcs>;
    isAffiliateAliasAvailable(alias: string): boolean | Promise<boolean>;
    activeUserAffiliate(): Nullable<Affiliate> | Promise<Nullable<Affiliate>>;
    availableSegments(): Segment[] | Promise<Segment[]>;
    accountFlowAgent(id: string): Nullable<FlowAgent> | Promise<Nullable<FlowAgent>>;
    accountFlowAgents(account: string): FlowAgent[] | Promise<FlowAgent[]>;
    accountFlowContacts(accountId: string, pagination?: Nullable<PaginatedFlowContactListOptions>, filter?: Nullable<FlowContactListFilter>): PaginatedFlowContactsList | Promise<PaginatedFlowContactsList>;
    flowRecordings(accountId: string, pagination?: Nullable<PaginatedFlowRecordingListOptions>, filter?: Nullable<FlowRecordingListFilter>): PaginatedFlowRecordingList | Promise<PaginatedFlowRecordingList>;
    accountFlowSegment(id: string): Nullable<FlowContactSegment> | Promise<Nullable<FlowContactSegment>>;
    accountFlowSegments(account: string): FlowContactSegment[] | Promise<FlowContactSegment[]>;
    accountFlow(id: string): Nullable<Flow> | Promise<Nullable<Flow>>;
    accountFlows(accountId: string): Flow[] | Promise<Flow[]>;
    knowledgeBase(id: string): Nullable<KnowledgeBase> | Promise<Nullable<KnowledgeBase>>;
    accountKnowledgeBases(accountId: string): KnowledgeBase[] | Promise<KnowledgeBase[]>;
    knowledgeBaseQA(id: string): Nullable<KnowledgeBaseQA> | Promise<Nullable<KnowledgeBaseQA>>;
    accountQuotationRequests(accountId: string, pagination?: Nullable<PaginatedQuotationRequestListOptions>, filter?: Nullable<QuotationRequestFilter>): PaginatedQuotationRequestList | Promise<PaginatedQuotationRequestList>;
    accountQuotationRequest(quotationId: string, requestSequentialId: string): Nullable<QuotationRequest> | Promise<Nullable<QuotationRequest>>;
    accountQuotations(account: string, mode: SoftDeleteQueryMode): Quotation[] | Promise<Quotation[]>;
    accountQuotation(id: string): Nullable<Quotation> | Promise<Nullable<Quotation>>;
    quotationModelBySegment(segmentId: string): Nullable<Quotation> | Promise<Nullable<Quotation>>;
    accountSubscriptionData(accountId: string): Nullable<AccountSubscriptionData> | Promise<Nullable<AccountSubscriptionData>>;
    subscriptionPlans(): SubscriptionPlan[] | Promise<SubscriptionPlan[]>;
    subscriptionPortal(input: SubscriptionPortalInput): SubscriptionPortalResult | Promise<SubscriptionPortalResult>;
    activeUser(): Nullable<ActiveUser> | Promise<Nullable<ActiveUser>>;
}

export interface OnBoardingStep {
    id: string;
    name: OnBoardingStepName;
    module: AccountUsageKind;
    date_created: string;
}

export interface Account {
    id: string;
    name: string;
    segment?: Nullable<Segment>;
    description?: Nullable<string>;
    website?: Nullable<string>;
    currency?: Nullable<CurrencyCode>;
    users: UserAccount[];
    active_subscription?: Nullable<AccountSubscription>;
    concluded_onboarding_steps: OnBoardingStep[];
}

export interface AccountApiKey {
    id: string;
    token?: Nullable<string>;
    maskedToken: string;
    name?: Nullable<string>;
    date_created: DateTime;
    date_updated?: Nullable<DateTime>;
}

export interface IMutation {
    createAccountApiKey(input?: Nullable<CreateAccountApiKeyInput>): AccountApiKey | Promise<AccountApiKey>;
    deleteAccountApiKey(id: string): Nullable<boolean> | Promise<Nullable<boolean>>;
    registerOnboardingStepForAccount(accountId: string, step: OnBoardingStepName): Nullable<OnBoardingStep> | Promise<Nullable<OnBoardingStep>>;
    updateAccountSettings(input: UpdateAccountSettingsInput): Nullable<Account> | Promise<Nullable<Account>>;
    updateAccountWidgetConfig(accountId: string, input: WidgetConfigInput): Nullable<WidgetConfig> | Promise<Nullable<WidgetConfig>>;
    createAffiliateForUser(input: CreateUserAffiliateInput): AffiliateSettingsResult | Promise<AffiliateSettingsResult>;
    updateUserAffiliate(input: UpdateUserAffiliateInput): Nullable<AffiliateSettingsResult> | Promise<Nullable<AffiliateSettingsResult>>;
    createExtraCreditCheckout(input: CreateExtraCreditCheckoutInput): CreateExtraCreditCheckoutResult | Promise<CreateExtraCreditCheckoutResult>;
    createDebugInteraction(input: CreateDebugInteractionInput): CreateDebugInteractionResult | Promise<CreateDebugInteractionResult>;
    createFlowAgent(input: CreateFlowAgentInput): FlowAgent | Promise<FlowAgent>;
    deleteFlowAgent(id: string): boolean | Promise<boolean>;
    updateFlowAgent(input: UpdateFlowAgentInput): FlowAgent | Promise<FlowAgent>;
    createFlowCalendarIntegration(input: CreateFlowCalendarIntegrationInput): FlowCalendarIntegration | Promise<FlowCalendarIntegration>;
    importFlowContactsFromCsv(input: ImportFlowContactsFromCsvInput, csv: Upload): ImportFlowContactsFromCsvResult | Promise<ImportFlowContactsFromCsvResult>;
    toggleFlowContactInSegment(input?: Nullable<ToggleFlowContactInSegmentInput>): FlowContact[] | Promise<FlowContact[]>;
    batchUpdateFlowContact(input: BatchUpdateFlowContact[]): FlowContact[] | Promise<FlowContact[]>;
    createFlowContactSegment(input: CreateFlowContactSegmentInput): FlowContactSegment | Promise<FlowContactSegment>;
    deleteFlowSegment(id: string): boolean | Promise<boolean>;
    updateFlowContactSegment(input: UpdateFlowContactSegmentInput): FlowContactSegment | Promise<FlowContactSegment>;
    createFlow(input: CreateFlowInput): Flow | Promise<Flow>;
    deleteFlow(id: string): boolean | Promise<boolean>;
    updateFlow(input: UpdateFlowInput): Flow | Promise<Flow>;
    createKnowledgeBase(accountId: string, input: CreateKnowledgeBaseInput): KnowledgeBase | Promise<KnowledgeBase>;
    deleteKnowledgeBase(id: string): boolean | Promise<boolean>;
    createKnowledgeBaseQA(input: CreateKnowledgeBaseQAInput[]): KnowledgeBaseQA[] | Promise<KnowledgeBaseQA[]>;
    deleteKnowledgeBaseQA(id: string[]): boolean | Promise<boolean>;
    updateKnowledgeBaseQA(input: UpdateKnowledgeBaseQAInput): KnowledgeBaseQA | Promise<KnowledgeBaseQA>;
    updateKnowledge(input: UpdateKnowledgeBaseInput): KnowledgeBase | Promise<KnowledgeBase>;
    visualizeQuotationRequest(requestId: string[]): Nullable<boolean> | Promise<Nullable<boolean>>;
    toggleQuotationRequestCheck(requestId: Nullable<string>[]): QuotationRequest[] | Promise<QuotationRequest[]>;
    createQuotation(input: CreateQuotationInput): Quotation | Promise<Quotation>;
    createQuotationQuestion(input: CreateQuotationQuestionInput[]): QuotationQuestion[] | Promise<QuotationQuestion[]>;
    deleteQuotation(id: string): boolean | Promise<boolean>;
    deleteQuotationQuestion(id: string): boolean | Promise<boolean>;
    updateQuotation(input: UpdateQuotationInput): Quotation | Promise<Quotation>;
    updateQuotationQuestion(input: UpdateQuotationQuestionInput): QuotationQuestion | Promise<QuotationQuestion>;
    createSubscriptionCheckout(input: CreateSubscriptionCheckoutInput): CreateSubscriptionCheckoutResult | Promise<CreateSubscriptionCheckoutResult>;
    loginUser(input: LoginUserInput): UserAuthResult | Promise<UserAuthResult>;
    logoutUser(): boolean | Promise<boolean>;
    registerUser(input: RegisterUserInput): RegisterUserResult | Promise<RegisterUserResult>;
    requestUserPasswordReset(email: string): boolean | Promise<boolean>;
    resetUserPassword(input: ResetUserPasswordInput): VerifyUserEmailResult | Promise<VerifyUserEmailResult>;
    updateUser(input: UpdateUserInput): UserAuthResult | Promise<UserAuthResult>;
    requestUserEmailVerification(id: string): boolean | Promise<boolean>;
    verifyUserEmail(id: string, token: string): VerifyUserEmailResult | Promise<VerifyUserEmailResult>;
    uploadFile(file: Upload): Asset[] | Promise<Asset[]>;
}

export interface AffiliateComission {
    id: string;
    status: AffiliateComissionStatus;
    amount: number;
    date_payment?: Nullable<DateTime>;
    date_created: DateTime;
}

export interface PaginatedAffiliateComissionList {
    items: AffiliateComission[];
    totalItems: number;
}

export interface AffiliateComissionsCalcs {
    paidAmountByPeriod?: number;
    pendingAmountToReceive: number;
    nextPaymentDate: DateTime;
    amountOfUsersIndicated: number;
}

export interface AffiliateSettingsResultError {
    errorCode: AffiliateSettingsResultErrorCode;
    message: string;
}

export interface Affiliate {
    id: string;
    alias: string;
    status: AffiliateStatus;
    payout_method?: Nullable<AffiliatePayoutMethod>;
    payout_method_key?: Nullable<string>;
    comission_duration_months?: Nullable<number>;
    comission_percentage?: Nullable<number>;
    date_created: DateTime;
    date_updated?: Nullable<DateTime>;
}

export interface Segment {
    id: string;
    title: string;
    translations: Translation[];
}

export interface CreateExtraCreditCheckoutResult {
    url: string;
}

export interface DebugInteractionCreated {
    interactionId: string;
}

export interface DebugInteractionError {
    errorCode: DebugInteractionErrorCode;
    message: string;
}

export interface FlowAgent {
    id: string;
    title: string;
    voice: FlowAgentVoice;
    editor_type: FlowAgentEditorType;
    script?: Nullable<string>;
    script_schema?: Nullable<JSON>;
    script_language?: Nullable<string>;
    knowledge_base?: Nullable<KnowledgeBase>;
    date_created: DateTime;
    date_updated?: Nullable<DateTime>;
}

export interface FlowCalendarIntegrationSettings__SavvyCal {
    private_key: string;
    link_id: string;
    type: FlowCalendarIntegrationType;
}

export interface FlowCalendarIntegration {
    id: string;
    name: string;
    settings: FlowCalendarIntegrationSettings;
}

export interface FlowContact {
    id: string;
    status: FlowContactStatus;
    first_name: string;
    last_name: string;
    email?: Nullable<string>;
    phone: string;
    segments: FlowContactSegment[];
    date_created: DateTime;
    date_updated?: Nullable<DateTime>;
}

export interface PaginatedFlowContactsList {
    items: FlowContact[];
    totalItems: number;
}

export interface ImportFlowContactsQueued {
    queued_items: number;
    import_id: string;
}

export interface ImportFlowContactsError {
    errorCode: ImportFlowContactsErrorCode;
    message: string;
}

export interface FlowRecording {
    id: string;
    contact_name: string;
    contact_phone: string;
    flow?: Nullable<Flow>;
    duration: number;
    record: Asset;
    date_created: DateTime;
}

export interface PaginatedFlowRecordingList {
    items: FlowRecording[];
    totalItems: number;
}

export interface FlowContactSegment {
    id: string;
    label: string;
    flow_instances_count: number;
    flow_contacts_count: number;
    date_created: DateTime;
    date_updated?: Nullable<DateTime>;
}

export interface Flow {
    id: string;
    name: string;
    type: FlowType;
    agent: FlowAgent;
    segment?: Nullable<FlowContactSegment>;
    status: FlowStatus;
    daily_budget: number;
    date_created: DateTime;
    date_updated?: Nullable<DateTime>;
}

export interface KnowledgeBase {
    id: string;
    title: string;
    type: KnowledgeBaseType;
    qa: KnowledgeBaseQA[];
    date_created: DateTime;
    date_updated?: Nullable<DateTime>;
}

export interface KnowledgeBaseQA {
    id: string;
    question: string;
    answer: string;
    knowledge_base: KnowledgeBase[];
    date_created: DateTime;
    date_updated?: Nullable<DateTime>;
}

export interface QuotationRequestData {
    question: string;
    answer: string;
}

export interface QuotationRequest {
    id: string;
    sequential_id: string;
    conversation: QuotationConversation;
    data?: Nullable<QuotationRequestData[]>;
    date_created: DateTime;
    date_updated?: Nullable<DateTime>;
    checked_at?: Nullable<DateTime>;
    checked_by?: Nullable<User>;
    quotation: Quotation;
    visualized_at?: Nullable<DateTime>;
}

export interface PaginatedQuotationRequestList {
    items: QuotationRequest[];
    totalItems: number;
}

export interface Quotation {
    id: string;
    title: string;
    hash: string;
    status: QuotationStatus;
    prompt_instructions?: Nullable<string>;
    date_created: DateTime;
    date_updated?: Nullable<DateTime>;
    date_deleted?: Nullable<DateTime>;
    questions?: Nullable<QuotationQuestion[]>;
    questions_count: number;
    requests_count: number;
    widget_config?: Nullable<WidgetConfig>;
}

export interface QuotationQuestion {
    id: string;
    quotation: string;
    label: string;
    condition?: Nullable<string>;
    parent?: Nullable<string>;
    order: number;
    active: boolean;
}

export interface CreditTransaction {
    creditId: string;
    reason?: Nullable<CreditTransactionReason>;
}

export interface AccountSubscriptionData {
    plan: string;
    plan_interval: PlanInterval;
    credits: number;
    period_start: DateTime;
    period_end: DateTime;
}

export interface CreateSubscriptionCheckoutResult {
    url: string;
}

export interface SubscriptionPlanPrice {
    price: string;
    currency: CurrencyCode;
    interval: PlanInterval;
    external_id: string;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    benefits?: Nullable<Nullable<Translation>[]>;
    prices: SubscriptionPlanPrice[];
}

export interface SubscriptionPortalResult {
    url: string;
}

export interface AccountSubscription {
    id: string;
    status: SubscriptionStatus;
}

export interface UserAccount {
    account: Account;
    account_id: string;
    user_id: string;
    user: User;
    role: AccountRole;
    allowed_modules: AccountUsageKind[];
}

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
}

export interface ActiveUser {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    accounts: UserAccount[];
    last_login?: Nullable<DateTime>;
    is_affiliate?: Nullable<boolean>;
    anonymous_id?: Nullable<string>;
    permissions: Permissions[];
    language?: Nullable<LanguageCode>;
}

export interface UserAuthError {
    errorCode: UserAuthErrorCode;
    message: string;
}

export interface UserRegistered {
    created_id: string;
    should_verify_email: boolean;
}

export interface ResetUserPasswordError {
    message: string;
    errorCode?: Nullable<ResetUserPasswordErrorCode>;
}

export interface VerifyUserEmailError {
    message: string;
    errorCode?: Nullable<VerifyUserEmailErrorCode>;
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
export type AffiliateSettingsResult = Affiliate | AffiliateSettingsResultError;
export type CreateDebugInteractionResult = DebugInteractionCreated | DebugInteractionError;
export type FlowCalendarIntegrationSettings = FlowCalendarIntegrationSettings__SavvyCal;
export type ImportFlowContactsFromCsvResult = ImportFlowContactsQueued | ImportFlowContactsError;
export type UserAuthResult = ActiveUser | UserAuthError;
export type RegisterUserResult = UserRegistered | UserAuthError;
export type ResetUserPasswordResult = ResetUserPasswordError | User;
export type VerifyUserEmailResult = VerifyUserEmailError | ActiveUser;
type Nullable<T> = T | null;
