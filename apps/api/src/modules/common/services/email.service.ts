import * as ReactTemplates from '@airtask/emails';
import {
	EmailTemplateFunction,
	WithLanguageCode,
} from '@airtask/emails/dist/utils/types';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { render } from '@react-email/render';
import { Queue } from 'bull';
import { ENV } from 'src/config/env';
import {
	EMAIL_QUEUE,
	EmailQueueData,
	SEND_EMAIL_WITH_RAW_HTML_JOB,
	SendEmailWithRawHtmlJobData,
} from '../jobs/email.queue';

type TemplateSettings = Omit<SendEmailWithRawHtmlJobData, 'to' | 'html' | 'subject'>;

@Injectable()
export class EmailService {
	constructor(
		@InjectQueue(EMAIL_QUEUE)
		private readonly queue: Queue<EmailQueueData>,
	) {}

	// private async send(data: SendEmailJobData) {
	// 	await this.queue.add(SEND_EMAIL_JOB, data);
	// }

	private async sendWithReactTemplate<Vars extends Record<string, any>>({
		template,
		props,
		...rest
	}: {
		template: EmailTemplateFunction<WithLanguageCode<Vars>>;
		props: WithLanguageCode<Vars>;
	} & Omit<SendEmailWithRawHtmlJobData, 'html' | 'subject'>) {
		const html = render(template.template(props)),
			subject = template.getSubject(props);

		await this.queue.add(SEND_EMAIL_WITH_RAW_HTML_JOB, <SendEmailWithRawHtmlJobData>{
			html,
			subject,
			isTesting: ENV.isTesting,
			...rest,
		});
	}

	sendVerificationEmail(
		to: string,
		props: WithLanguageCode<ReactTemplates.VerifyEmailVariables>,
	) {
		return this.sendWithReactTemplate({
			to,
			template: ReactTemplates.VerifyEmailTemplate,
			props,
		});
	}

	sendPasswordReset(
		to: string,
		props: WithLanguageCode<ReactTemplates.ResetPasswordVariables>,
	) {
		return this.sendWithReactTemplate({
			to,
			props,
			template: ReactTemplates.ResetPasswordEmailTemplate,
		});
	}

	sendQuotationNotification(
		to: string,
		props: WithLanguageCode<ReactTemplates.QuotationNotificationVariables>,
		settings?: TemplateSettings,
	) {
		return this.sendWithReactTemplate({
			to,
			props,
			template: ReactTemplates.QuotationNotificationEmailTemplate,
			...settings,
		});
	}

	usageLimitCloseToExceed(
		to: string,
		props: WithLanguageCode<ReactTemplates.UsageLimitCloseToExceedVariables>,
	) {
		return this.sendWithReactTemplate({
			to,
			props,
			template: ReactTemplates.UsageLimitCloseToExceedEmailTemplate,
		});
	}
	usageLimitExceeded(
		to: string,
		props: WithLanguageCode<ReactTemplates.UsageLimitExceededVariables>,
	) {
		return this.sendWithReactTemplate({
			to,
			props,
			template: ReactTemplates.UsageLimitExceededEmailTemplate,
		});
	}

	subscriptionPaymentFailed(
		to: string,
		props: WithLanguageCode<ReactTemplates.SubscriptionPaymentFailedVariables>,
	) {
		return this.sendWithReactTemplate({
			to,
			props,
			template: ReactTemplates.SubscriptionPaymentFailedEmailTemplate,
		});
	}

	importFlowContactsResult(
		to: string,
		props: WithLanguageCode<ReactTemplates.ImportFlowContactsResultVariables>,
		settings?: TemplateSettings,
	) {
		return this.sendWithReactTemplate({
			to,
			template: ReactTemplates.ImportFlowContactsResultEmailTemplate,
			props,
			...settings,
		});
	}
}
