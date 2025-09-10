import { ForbiddenException } from '@nestjs/common';

export class AccountNotAllowedToModuleError extends ForbiddenException {
	constructor() {
		super('account-not-allowed-to-module');
	}
}
