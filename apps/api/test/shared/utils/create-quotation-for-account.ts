import { faker } from '@faker-js/faker';
import { Prisma, quotation } from '@prisma/client';
import { TestEnvironment } from 'test/config/setup-test-environment';
import { v4 } from 'uuid';

export const createQuotationForAccount = (
	environment: TestEnvironment,
	data: {
		accountId: number;
		quotationInput?: Partial<Prisma.quotationCreateInput>;
	},
): Promise<quotation> => {
	const { quotationInput, accountId } = data;

	return environment.prisma.quotation.create({
		data: {
			id: v4(),
			hash: v4(),
			title: faker.lorem.words(3),
			...quotationInput,
			account_quotation_accountToaccount: {
				connect: {
					id: accountId,
				},
			},
		},
	});
};
