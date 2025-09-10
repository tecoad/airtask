import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountUsageKind } from 'src/graphql';
import { AccountsService } from 'src/modules/accounts/services/accounts.service';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { UsageManagerService } from 'src/modules/subscriptions/services/usage-manager.service';
import {
	QuotationAvailabilityError,
	QuotationAvailabilityErrorCode,
} from 'src/public-graphql';
import { mockQuotation } from 'test/mocks/entities/quotation';
import { mockPrisma } from 'test/mocks/prisma';
import { QUOTATIONS_QUEUE } from '../jobs/constants';
import { PublicQuotationsService } from './public-quotations.service';

describe('PublicQuotationsService', () => {
	let service: PublicQuotationsService;
	let module: TestingModule;
	const prismaMocked = mockPrisma();
	const usageManagerService = {
		isAccountAllowedToPerformOperation: jest.fn(),
	};

	beforeEach(jest.clearAllMocks);

	beforeAll(async () => {
		module = await Test.createTestingModule({
			providers: [
				PublicQuotationsService,
				{
					provide: UsageManagerService,
					useValue: usageManagerService,
				},
				{ provide: PrismaService, useValue: prismaMocked },
				{
					provide: getQueueToken(QUOTATIONS_QUEUE),
					useValue: { add: jest.fn() },
				},
				{ provide: AccountsService, useValue: {} },
			],
		}).compile();

		service = module.get(PublicQuotationsService);

		jest.spyOn(service, 'promptQuotationConversation').mockImplementation(jest.fn());
	});

	afterAll(async () => {
		await module.close();
	});

	describe('findPublic', () => {
		it('return QuotationAvailabilityError if quotation is not found', async () => {
			prismaMocked.quotation.findFirst.mockResolvedValueOnce(null);

			const result = await service.findPublic('hash');

			expect(result).toEqual({
				errorCode: QuotationAvailabilityErrorCode.QUOTATION_NOT_FOUND,
				message: expect.any(String),
			} as QuotationAvailabilityError);
		});

		it('return QuotationAvailabilityError if account is not allowed to perform quotation operation ', async () => {
			usageManagerService.isAccountAllowedToPerformOperation.mockResolvedValueOnce(false);

			prismaMocked.quotation.findFirst.mockResolvedValueOnce(
				mockQuotation({
					account: 645,
				}),
			);

			const result = await service.findPublic('hash');

			expect(usageManagerService.isAccountAllowedToPerformOperation).toBeCalledWith(
				645,
				AccountUsageKind.quotation,
				1,
			);
			expect(result).toEqual({
				errorCode: QuotationAvailabilityErrorCode.QUOTATION_WITHOUT_ACTIVE_SUBSCRIPTION,
				message: expect.any(String),
			} as QuotationAvailabilityError);
		});
	});
});
