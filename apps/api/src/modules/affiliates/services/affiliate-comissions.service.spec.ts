import { Test, TestingModule } from '@nestjs/testing';
import { isSameDay } from 'date-fns';
import { AccountsService } from 'src/modules/accounts/services/accounts.service';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { mockPrisma } from 'test/mocks/prisma';
import { AffiliateComissionsService } from './affiliate-comissions.service';

describe('AffiliateComissionsService', () => {
	let module: TestingModule, service: AffiliateComissionsService;
	const prismaMocked = mockPrisma(),
		accountsServiceMock = {
			findSubscriptionPlan: jest.fn(),
		};

	beforeAll(async () => {
		module = await Test.createTestingModule({
			providers: [
				AffiliateComissionsService,
				{
					provide: PrismaService,
					useValue: prismaMocked,
				},
				{
					provide: AccountsService,
					useValue: accountsServiceMock,
				},
			],
		}).compile();

		service = module.get(AffiliateComissionsService);
	});

	afterAll(async () => {
		await module.close();
	});

	describe('nextPaymentDay', () => {
		it.each([
			[new Date(2023, 6, 1), new Date(2023, 6, 7)], // 1 de julho de 2023, 7 de julho de 2023
			[new Date(2023, 6, 15), new Date(2023, 7, 7)], // 15 de julho de 2023, 7 de agosto de 2023
			[new Date(2023, 7, 30), new Date(2023, 8, 7)], // 30 de agosto de 2023, 7 de setembro de 2023
			[new Date(2023, 10, 16), new Date(2023, 11, 7)], // 16 de novembro de 2023, 7 de dezembro de 2023
			[new Date(2025, 5, 18), new Date(2025, 6, 7)], // 18 de junho de 2025, 7 de julho de 2025
			[new Date(2025, 7, 20), new Date(2025, 8, 5)], // 20 de agosto de 2025, 5 de setembro de 2025
			[new Date(2025, 8, 4), new Date(2025, 8, 5)], // 4 de setembro de 2025, 5 de setembro de 2025
			[new Date(2025, 9, 4), new Date(2025, 9, 7)], //
		])('should return the correct next payment day for %s', (date, expected) => {
			jest.useFakeTimers().setSystemTime(date);

			const result = service.nextPaymentDay;

			expect(isSameDay(result, expected)).toBe(true);

			jest.useRealTimers();
		});
	});
});
