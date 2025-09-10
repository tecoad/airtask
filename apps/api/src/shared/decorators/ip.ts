import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as requestIp from 'request-ip';

export const extractIpFromRequest = (req: any) => {
	try {
		if (req.clientIp) return req.clientIp;
		return requestIp.getClientIp(req);
	} catch {
		return null;
	}
};

export const IpAddress = createParamDecorator((_, ctx: ExecutionContext) => {
	const req = ctx.switchToHttp().getRequest();

	return extractIpFromRequest(req);
});
