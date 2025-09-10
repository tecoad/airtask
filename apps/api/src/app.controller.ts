import { Controller, Get, Query } from '@nestjs/common';
import { CurrencyCode } from './graphql';

@Controller()
export class AppController {
	@Get('currencyCodes')
	currencyCodes(@Query('q') search: string) {
		return Object.values(CurrencyCode).filter((item) =>
			search.trim() ? item.includes(search.toUpperCase()) : true,
		);
	}
}
