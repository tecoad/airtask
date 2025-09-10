import { Module } from '@nestjs/common';
import { AccountsModule } from 'src/modules/accounts/accounts.module';
import { CommonModule } from 'src/modules/common/common.module';
import { SubscriptionsModule } from 'src/modules/subscriptions/subscriptions.module';
import { FlowController } from './v1/subscription.controller';

@Module({
	imports: [CommonModule, AccountsModule, SubscriptionsModule],
	controllers: [FlowController],
})
export class AccountPublicApiModule {}
