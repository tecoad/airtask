import { Module, forwardRef } from '@nestjs/common';
import { AccountsModule } from 'src/modules/accounts/accounts.module';
import { AffiliatesModule } from 'src/modules/affiliates/affiliates.module';
import { CommonModule } from 'src/modules/common/common.module';
import { FlowsModule } from 'src/modules/flows/flows.module';
import { KnowledgebaseModule } from 'src/modules/knowledgebase/knowledgebase.module';
import { QuotationsModule } from 'src/modules/quotations/quotations.module';
import { SubscriptionsModule } from 'src/modules/subscriptions/subscriptions.module';
import { UsersModule } from 'src/modules/users/users.module';
import { AccountApiKeysResolver } from './resolvers/account/account-api-keys.resolver';
import { AccountWidgetSettingsResolver } from './resolvers/account/account-widget-settings.resolver';
import { AccountsResolver } from './resolvers/account/accounts.resolver';
import { AffiliateComissionsCalcsResolver } from './resolvers/affiliate/affiliate-comissions-calcs.resolver';
import { AffiliatesResolver } from './resolvers/affiliate/affiliates.resolver';
import { affiliateUnionsResolvers } from './resolvers/affiliate/affiliates.unions.resolver';
import { PaginatedAffiliateComissionResolver } from './resolvers/affiliate/paginated-affiliate-comissions.resolver';
import { AccountFlowsAgentsResolvers } from './resolvers/flow-agent/account-flows-agents.resolver';
import { FlowAgentDebugInteractionResolver } from './resolvers/flow-agent/debug-interaction.resolver';
import { CreateDebugInteractionResultResolver } from './resolvers/flow-agent/debug-interaction.unions.resolver';
import { FlowCalendarIntegrationSettingsResolver } from './resolvers/flow-calendar-integration/flow-calendar-integration-settings.unions.resolver';
import { FlowCalendarIntegrationResolver } from './resolvers/flow-calendar-integration/flow-calendar-integration.resolver';
import { AccountFlowsContactsResolver } from './resolvers/flow-contact/account-flows-contacts.resolver';
import { accountFlowsContactsUnionsResolvers } from './resolvers/flow-contact/account-flows-contacts.unions.resolver';
import { PaginatedFlowContactsResolver } from './resolvers/flow-contact/paginated-flows-contacts.resolver';
import { FlowRecordingResolver } from './resolvers/flow-recording/flow-recording.resolver';
import { PaginatedFlowRecordingsResolver } from './resolvers/flow-recording/paginated-flow-recording.resolver';
import { AccountFlowsContactSegmentsResolvers } from './resolvers/flow-segment/account-flows-contact-segments.resolver';
import { AccountFlowsResolver } from './resolvers/flow/account-flows.resolver';
import { KnowledgeBaseQAResolver } from './resolvers/knowledge-base/knowledge-base-qa.resolver';
import { KnowledgeBaseResolver } from './resolvers/knowledge-base/knowledge-base.resolver';
import { AccountQuotationRequestResolver } from './resolvers/quotation-request/account-quotations-requests.resolver';
import { PaginatedQuotationRequestListResolver } from './resolvers/quotation-request/paginated-quotations-requests.resolver';
import { AccountQuotationsResolver } from './resolvers/quotation/account-quotations.resolver';
import { SubscriptionPlanResolver } from './resolvers/subscription/subscriptions-plan.resolver';
import { SubscriptionsResolver } from './resolvers/subscription/subscriptions.resolver';
import { UserAccountsResolver, UsersResolver } from './resolvers/user/users.resolver';
import { usersUnionsResolvers } from './resolvers/user/users.unions.resolver';

const resolvers = [
	...usersUnionsResolvers,
	UsersResolver,
	UserAccountsResolver,

	AccountsResolver,
	AccountApiKeysResolver,

	AccountQuotationsResolver,
	AccountQuotationRequestResolver,
	PaginatedQuotationRequestListResolver,
	AccountWidgetSettingsResolver,

	SubscriptionsResolver,
	SubscriptionPlanResolver,

	AffiliatesResolver,
	PaginatedAffiliateComissionResolver,
	AffiliateComissionsCalcsResolver,
	...affiliateUnionsResolvers,

	AccountFlowsResolver,
	AccountFlowsAgentsResolvers,
	AccountFlowsContactSegmentsResolvers,
	AccountFlowsContactsResolver,
	PaginatedFlowContactsResolver,
	...accountFlowsContactsUnionsResolvers,
	FlowRecordingResolver,
	PaginatedFlowRecordingsResolver,

	FlowCalendarIntegrationResolver,
	FlowCalendarIntegrationSettingsResolver,

	FlowAgentDebugInteractionResolver,
	CreateDebugInteractionResultResolver,

	KnowledgeBaseResolver,
	KnowledgeBaseQAResolver,
];

@Module({
	imports: [
		forwardRef(() => CommonModule),
		forwardRef(() => UsersModule),
		forwardRef(() => AccountsModule),
		forwardRef(() => SubscriptionsModule),
		forwardRef(() => QuotationsModule),
		forwardRef(() => AffiliatesModule),
		forwardRef(() => FlowsModule),
		forwardRef(() => KnowledgebaseModule),
	],
	providers: [...resolvers],
})
export class PrivateApiModule {}
