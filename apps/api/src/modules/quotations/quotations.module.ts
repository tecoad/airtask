import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { Module, forwardRef } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';
import { CommonModule } from '../common/common.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { QUOTATIONS_QUEUE } from './jobs/constants';
import { QuotationsQueue } from './jobs/quotations.queue';
import { AccountQuotationsQuestionsService } from './services/account-quotations-questions.service';
import { AccountQuotationsRequestsService } from './services/account-quotations-requests.service';
import { AccountQuotationsService } from './services/account-quotations.service';
import { PublicQuotationsService } from './services/public-quotations.service';
import { WidgetConfigService } from './services/widget-config.service';

@Module({
	imports: [
		forwardRef(() => CommonModule),
		BullModule.registerQueue({
			name: QUOTATIONS_QUEUE,
		}),
		HttpModule.register({}),
		forwardRef(() => AccountsModule),
		forwardRef(() => SubscriptionsModule),
	],
	providers: [
		WidgetConfigService,
		PublicQuotationsService,
		AccountQuotationsService,
		AccountQuotationsQuestionsService,
		AccountQuotationsRequestsService,
		QuotationsQueue,
	],
	exports: [
		AccountQuotationsService,
		AccountQuotationsQuestionsService,
		AccountQuotationsRequestsService,
		PublicQuotationsService,
		WidgetConfigService,
	],
})
export class QuotationsModule {}
