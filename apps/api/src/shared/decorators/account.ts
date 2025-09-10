import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const CurrentAccount = createParamDecorator((_, rawCtx: ExecutionContext) => {
	const req = rawCtx.switchToHttp().getRequest();

	return req.account;
});
