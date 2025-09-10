import { HttpException } from '@nestjs/common';

export class WidgetDomainNotAllowed extends HttpException {
	constructor() {
		super('widget-domain-not-allowed', 403);
	}
}
