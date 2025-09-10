import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator((_, rawCtx: ExecutionContext) => {
	const ctx = GqlExecutionContext.create(rawCtx).getContext();

	return ctx.req.user;
});
