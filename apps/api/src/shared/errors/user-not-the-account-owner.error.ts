import { ForbiddenException } from '@nestjs/common';

export class UserNotAccountManagerError extends ForbiddenException {
	constructor() {
		super('user-not-a-account-manager');
	}
}
