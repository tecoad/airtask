import { Controller, Get, UseGuards } from '@nestjs/common';
import { account } from '@prisma/client';
import { AccountApiAuthGuard } from 'src/modules/accounts/guards/account-rest-api-auth.guard';
import { CreditsManagerService } from 'src/modules/subscriptions/services/credits-manager.service';
import { CurrentAccount } from 'src/shared/decorators/account';
import { prefix } from '.';

@Controller(prefix('subscription'))
export class FlowController {
	constructor(private readonly creditsManager: CreditsManagerService) {}

	@UseGuards(AccountApiAuthGuard)
	@Get('data')
	async data(@CurrentAccount() account: account) {
		const { balance } = await this.creditsManager.totalBalanceForAccount(account.id);

		return {
			name: account.name,
			currency: account.currency,
			availableCredits: balance.toNumber(),
		};
	}
}
