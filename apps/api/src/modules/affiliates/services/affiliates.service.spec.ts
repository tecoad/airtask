import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { AccountsService } from 'src/modules/accounts/services/accounts.service';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { TrackingService } from 'src/modules/common/services/tracking.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { AffiliateComissionStatus } from 'src/shared/types/db';
import { mockAccount, mockSubscription } from 'test/mocks/entities/account';
import { mockAffiliate, mockAffiliateComission } from 'test/mocks/entities/affiliate';
import { mockPrisma } from 'test/mocks/prisma';
import { AffiliatesService } from './affiliates.service';

describe('AffiliatesService', () => {
	let module: TestingModule, service: AffiliatesService;
	const prismaMocked = mockPrisma(),
		accountsServiceMock = {
			findSubscriptionPlan: jest.fn(),
		};

	beforeAll(async () => {
		module = await Test.createTestingModule({
			providers: [
				AffiliatesService,
				{
					provide: PrismaService,
					useValue: prismaMocked,
				},
				{
					provide: AccountsService,
					useValue: accountsServiceMock,
				},
				{
					provide: TrackingService,
					useValue: {
						affiliateComission: jest.fn(),
					},
				},
				{
					provide: UsersService,
					useValue: {},
				},
			],
		}).compile();

		service = module.get(AffiliatesService);
	});

	afterAll(async () => {
		await module.close();
	});

	describe('createAccountSubscriptionComissionIfNeeded', () => {
		beforeAll(() => {
			accountsServiceMock.findSubscriptionPlan.mockResolvedValue({
				subscription: mockSubscription(),
			});
		});

		it("should not create if account if account doesn't has a referrer", async () => {
			const account = mockAccount({ referrer: null });
			prismaMocked.account.findUnique.mockResolvedValueOnce(account);

			await service.createAccountSubscriptionComissionIfNeeded(
				account.id,
				new Prisma.Decimal(100),
			);

			expect(prismaMocked.affiliate_comission.create).not.toBeCalled();
		});

		it('should not create if referral received all comissions', async () => {
			const account = {
				...mockAccount({
					referrer: 120,
				}),
				// Has 2 comissions created
				affiliate_comission_affiliate_comission_accountToaccount: [
					mockAffiliateComission(),
					mockAffiliateComission(),
				],
			};
			prismaMocked.account.findUnique.mockResolvedValueOnce(account);

			const affiliate = mockAffiliate({
				comission_duration_months: 2,
			});
			prismaMocked.affiliate.findUnique.mockResolvedValueOnce(affiliate);

			await service.createAccountSubscriptionComissionIfNeeded(
				account.id,
				new Prisma.Decimal(100),
			);

			expect(prismaMocked.affiliate_comission.create).not.toBeCalled();
		});

		it('should create a new comission if referral has not received all comissions', async () => {
			const account = {
				...mockAccount({
					referrer: 120,
				}),
				// Has 2 comissions created
				affiliate_comission_affiliate_comission_accountToaccount: [
					mockAffiliateComission(),
					mockAffiliateComission(),
				],
			};
			prismaMocked.account.findUnique.mockResolvedValueOnce(account);

			const affiliate = mockAffiliate({
				comission_duration_months: 3,
				comission_percentage: 12,
			});
			prismaMocked.affiliate.findUnique.mockResolvedValueOnce(affiliate);

			// Mock create return
			prismaMocked.affiliate_comission.create.mockResolvedValueOnce({
				amount: new Prisma.Decimal(12),
			});

			await service.createAccountSubscriptionComissionIfNeeded(
				account.id,
				new Prisma.Decimal(100),
			);

			expect(prismaMocked.affiliate_comission.create).toHaveBeenCalledWith({
				data: {
					amount: 12,
					status: AffiliateComissionStatus.Pending,
					account: account.id,
					affiliate: affiliate.id,
				},
			});
		});
	});
});
