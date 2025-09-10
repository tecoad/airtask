import { ForbiddenException } from '@nestjs/common';

export class AccountWithoutActiveSubscriptionError extends ForbiddenException {
	constructor() {
		super('user-not-a-account-member');
	}
}
