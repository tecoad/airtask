import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import * as FormData from 'form-data';
import { lastValueFrom } from 'rxjs';
import { ENV } from 'src/config/env';
import { isAxiosError, mapAxiosErrorToLog } from 'src/shared/utils/is-axios-error';
import { CreateTicketDTO } from '../common/dto/create-ticket.dto';

@Injectable()
export class SupportService {
	httpService: HttpService;
	private logger = new Logger(SupportService.name);

	constructor(setupHttpService: HttpService) {
		this.httpService = setupHttpService;

		this.httpService.axiosRef.interceptors.response.use(undefined, (error) => {
			if (isAxiosError(error)) {
				this.logger.error('Error at SupportService request', mapAxiosErrorToLog(error));
			} else {
				this.logger.error('Unexpected error at SupportService request', error);
			}

			return Promise.reject(error);
		});

		this.refreshToken();
	}

	private set token(token: string) {
		this.httpService.axiosRef.defaults.headers.common['Authorization'] =
			`Bearer ${token}`;
	}
	private get token() {
		return this.httpService.axiosRef.defaults.headers.common?.['Authorization'] as string;
	}

	private async refreshToken() {
		try {
			const form = new FormData();

			form.append('client_id', ENV.HELPSCOUT.app_id);
			form.append('client_secret', ENV.HELPSCOUT.app_secret);
			form.append('grant_type', 'client_credentials');

			const { data } = await lastValueFrom(
				this.httpService.post('v2/oauth2/token', form, {
					headers: form.getHeaders(),
				}),
			);

			if (data.access_token) {
				this.token = data.access_token;
				const timeout = setTimeout(
					() => {
						this.refreshToken();
						clearTimeout(timeout);
					},
					(data.expires_in - 5 * 60) * 1000,
				);
			}
		} catch {
			/** */
		}
	}

	async createTicket(input: CreateTicketDTO) {
		const { status, headers } = await lastValueFrom(
			this.httpService.post('/v2/conversations', input),
		);

		// await this.notificationsService.supportCreated({
		//   customerName: `${input.customer.firstName} ${input.customer.lastName}`,
		//   email: input.customer.email,
		//   subject: input.threads[0].text.slice(0, 50),
		// });

		return { status, ticketId: headers['web-location']?.split('/')?.pop() };
	}
}
