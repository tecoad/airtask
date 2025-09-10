import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Attachment, ServerClient, TemplatedMessage } from 'postmark';
import { ENV } from 'src/config/env';

export const EMAIL_QUEUE = 'email-queue';
export const SEND_EMAIL_JOB = 'send-email-job';
export const SEND_EMAIL_WITH_RAW_HTML_JOB = 'send-email-with-raw-html-job';

export type EmailQueueData = SendEmailJobData | SendEmailWithRawHtmlJobData;

export type SendEmailJobData = {
	template: string;
	variables: Record<string, any>;
	to: string;
	replyTo?: string;
	isTesting?: boolean;
};
export type SendEmailWithRawHtmlJobData = {
	html: string;
	to: string;
	subject: string;
	replyTo?: string;
	isTesting?: boolean;
	attachments?: {
		name: string;
		// base64 string
		content: string;
		contentType: string;
	}[];
};

@Processor(EMAIL_QUEUE)
export class EmailQueue {
	private readonly postmark = new ServerClient(ENV.POSTMARK.api_token!);
	private readonly testingPostmark = new ServerClient(ENV.POSTMARK.sandbox_api_token!);

	@Process(SEND_EMAIL_JOB)
	async send(job: Job<SendEmailJobData>) {
		const { template, variables, to, replyTo, isTesting } = job.data;

		const data = await this[
			isTesting ? 'testingPostmark' : 'postmark'
		].sendEmailWithTemplate(
			new TemplatedMessage(
				ENV.EMAIL.from!,
				template,
				variables,
				to,
				undefined,
				undefined,
				replyTo,
			),
		);

		await job.progress(100);

		return data;
	}

	@Process(SEND_EMAIL_WITH_RAW_HTML_JOB)
	async sendWithRawHtml(job: Job<SendEmailWithRawHtmlJobData>) {
		const { to, replyTo, html, subject, isTesting, attachments } = job.data;

		await job.progress(50);

		const data = await this[isTesting ? 'testingPostmark' : 'postmark'].sendEmail({
			From: ENV.EMAIL.from!,
			To: to,
			Subject: subject,
			HtmlBody: html,
			ReplyTo: replyTo,
			Attachments: attachments?.map(
				(v) => new Attachment(v.name, v.content, v.contentType),
			),
		});

		await job.progress(100);

		return data;
	}
}
