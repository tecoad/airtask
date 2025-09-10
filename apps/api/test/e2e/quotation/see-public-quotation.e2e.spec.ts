import { quotation } from '@prisma/client';
import { UsageManagerService } from 'src/modules/subscriptions/services/usage-manager.service';
import { QuotationStatus } from 'src/shared/types/db';
import {
	setupTestEnvironment,
	TestEnvironment,
} from 'test/config/setup-test-environment';
import { PUBLIC_QUOTATION } from 'test/shared/gql/public/quotation';
import {
	PublicQuotationQuery,
	PublicQuotationQueryVariables,
	QuotationAvailabilityError,
	QuotationAvailabilityErrorCode,
} from 'test/shared/test-gql-public-api-schema';
import { v4 } from 'uuid';

jest.setTimeout(15000);

// Here we mock the usage manager service to always return true
// because it will be tested on its own module
jest
	.spyOn(UsageManagerService.prototype, 'isAccountAllowedToPerformOperation')
	.mockResolvedValue(true);

describe('See Public Quotation', () => {
	let quotation: quotation, environment: TestEnvironment;

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		quotation = await environment.prisma.quotation.create({
			data: {
				id: v4(),
				hash: v4(),
				title: 'quotation-title',
				status: QuotationStatus.Published,
				account_quotation_accountToaccount: {
					create: {
						widget_config_account_widget_configTowidget_config: {
							create: {
								button_size: 20,
								button_color: '#000000',
							},
						},
					},
				},
			},
		});
	});

	afterAll(async () => {
		await environment.prisma.quotation.delete({ where: { id: quotation.id } });

		await environment.close();
	});

	it('see public quotation with account level settings by hash', async () => {
		const res = await environment.publicApiClient.query<
			PublicQuotationQuery,
			PublicQuotationQueryVariables
		>(PUBLIC_QUOTATION, {
			hash: quotation.hash,
		});

		expect(res.data.publicQuotation).toEqual(<PublicQuotationQuery['publicQuotation']>{
			hash: quotation.hash,
			title: quotation.title,
			widget_config: {
				button_size: 20,
				button_color: '#000000',
			},
		});
	});

	it('see public quotation with account level settings by id', async () => {
		const res = await environment.publicApiClient.query<
			PublicQuotationQuery,
			PublicQuotationQueryVariables
		>(PUBLIC_QUOTATION, {
			id: quotation.id,
		});

		expect(res.data.publicQuotation).toEqual(<PublicQuotationQuery['publicQuotation']>{
			hash: quotation.hash,
			title: quotation.title,
			widget_config: {
				button_size: 20,
				button_color: '#000000',
			},
		});
	});

	it('see public quotation with quotation level settings', async () => {
		await environment.prisma.quotation.update({
			where: {
				id: quotation.id,
			},
			data: {
				widget_config_quotation_widget_configTowidget_config: {
					create: {
						button_size: 50,
						button_color: 'the-quotation-button-color',
					},
				},
			},
		});

		// Now, quotation level settings should be returned instead of account level settings
		const res = await environment.publicApiClient.query<
			PublicQuotationQuery,
			PublicQuotationQueryVariables
		>(PUBLIC_QUOTATION, {
			hash: quotation.hash,
		});

		expect(res.data.publicQuotation).toEqual(<PublicQuotationQuery['publicQuotation']>{
			hash: quotation.hash,
			title: quotation.title,
			widget_config: {
				button_size: 50,
				button_color: 'the-quotation-button-color',
			},
		});
	});

	it('cant see public quotation if archived', async () => {
		await environment.prisma.quotation.update({
			where: { id: quotation.id },
			data: { status: QuotationStatus.Archived },
		});

		const res = await environment.publicApiClient.query<
			PublicQuotationQuery,
			PublicQuotationQueryVariables
		>(PUBLIC_QUOTATION, {
			hash: quotation.hash,
		});

		expect(res.data.publicQuotation).toEqual(<QuotationAvailabilityError>{
			errorCode: QuotationAvailabilityErrorCode.QuotationNotFound,
			message: expect.any(String),
		});
	});
});
