import { faker } from '@faker-js/faker';
import { quotation, quotation_conversation, quotation_question } from '@prisma/client';
import { QuotationConversationStatus, QuotationStatus } from 'src/shared/types/db';

export const mockQuotation = (input?: Partial<quotation>): quotation => ({
	id: faker.datatype.uuid(),
	date_created: faker.date.past(),
	date_updated: faker.date.past(),
	account: faker.datatype.number(),
	hash: faker.datatype.uuid(),
	status: QuotationStatus.Published,
	title: faker.lorem.sentence(),
	prompt_instructions: faker.lorem.sentence(),
	date_deleted: null,
	widget_config: null,
	...input,
});

export const mockQuotationConversation = (
	input?: Partial<quotation_conversation>,
): quotation_conversation => ({
	date_created: faker.date.past(),
	date_updated: faker.date.past(),
	recipient_email: faker.internet.email(),
	recipient_first_name: faker.name.firstName(),
	recipient_last_name: faker.name.lastName(),
	recipient_phone: faker.phone.number(),
	id: faker.datatype.number(),
	message: faker.lorem.sentence(),
	quotation: faker.datatype.uuid(),
	code: faker.datatype.uuid(),
	status: QuotationConversationStatus.Active,
	...input,
});

export const mockQuotationQuestion = (
	input?: Partial<quotation_question>,
): quotation_question => ({
	id: faker.datatype.uuid(),
	condition: faker.lorem.sentence(),
	date_created: faker.date.past(),
	date_updated: faker.date.past(),
	label: faker.lorem.sentence(),
	parent: faker.datatype.uuid(),
	quotation: faker.datatype.uuid(),
	order: faker.datatype.number(),
	active: faker.datatype.boolean(),
	...input,
});
