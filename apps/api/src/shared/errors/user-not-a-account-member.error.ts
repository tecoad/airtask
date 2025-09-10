import { ForbiddenException } from '@nestjs/common';

export class UserNotAAccountMemberError extends ForbiddenException {
	constructor() {
		super('user-not-a-account-member');
	}
}
