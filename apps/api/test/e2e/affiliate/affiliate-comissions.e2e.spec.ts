import { UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { add, sub } from 'date-fns';
import {
	firstDayOfLastMonth,
	lastDayOfLastMonth,
} from 'src/modules/metrics/helpers/date';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import {
	AFFILIATE_COMISSIONS,
	AFFILIATE_COMISSIONS_CALCS,
} from 'test/shared/gql/private/user-affiliate';
import {
	AffiliateComissionFragment,
	AffiliateComissionQuery,
	AffiliateComissionQueryVariables,
	AffiliateComissionStatus,
	AffiliateComissionsCalcsFragment,
	AffiliateComissionsCalcsQuery,
	AffiliateComissionsCalcsQueryVariables,
	FilterOperator,
	SortOrder,
} from 'test/shared/test-gql-private-api-schema.ts';
import {
	UserWithAffiliate,
	createUserWithAffiliate,
} from 'test/shared/utils/create-user-with-affiliate';

jest.setTimeout(30000);

describe('Affiliate comissions', () => {
	let environment: TestEnvironment, user: UserWithAffiliate;

	beforeAll(async () => {
		environment = await setupTestEnvironment();
		user = await createUserWithAffiliate(environment);

		// Create 3 comissions for user
		await environment.prisma.affiliate_comission.create({
			data: {
				amount: new Prisma.Decimal(1),
				affiliate: user.affiliate_affiliate_userTouser!.id,
				status: AffiliateComissionStatus.Pending,
			},
		});
		await environment.prisma.affiliate_comission.create({
			data: {
				amount: new Prisma.Decimal(2),
				affiliate: user.affiliate_affiliate_userTouser!.id,
				status: AffiliateComissionStatus.Pending,
			},
		});
		await environment.prisma.affiliate_comission.create({
			data: {
				amount: new Prisma.Decimal(3),
				affiliate: user.affiliate_affiliate_userTouser!.id,
				status: AffiliateComissionStatus.Paid,
			},
		});
	});

	afterAll(async () => {
		await environment.close();
	});

	it('cant query affiliate comissions without auth', async () => {
		await expect(
			environment.privateApiClient.query<
				AffiliateComissionQuery,
				AffiliateComissionQueryVariables
			>(AFFILIATE_COMISSIONS, {}),
		).rejects.toThrowError(new UnauthorizedException().message);

		// Auth for next tests
		environment.privateApiClient.authenticateAsUser(user.id, user.email);
	});

	let allComissionsResult: AffiliateComissionFragment[];

	it('query affiliate comissions', async () => {
		const { data } = await environment.privateApiClient.query<
			AffiliateComissionQuery,
			AffiliateComissionQueryVariables
		>(AFFILIATE_COMISSIONS, {});

		expect(data.affiliateComissions?.totalItems).toBe(3);
		expect(data.affiliateComissions?.items).toEqual([
			{
				id: expect.any(String),
				amount: 1,
				status: AffiliateComissionStatus.Pending,
				date_payment: null,
			},
			{
				id: expect.any(String),
				amount: 2,
				status: AffiliateComissionStatus.Pending,
				date_payment: null,
			},
			{
				id: expect.any(String),
				amount: 3,
				status: AffiliateComissionStatus.Paid,
				date_payment: null,
			},
		] as AffiliateComissionFragment[]);

		allComissionsResult = data.affiliateComissions!.items;
	});

	it.each([
		[AffiliateComissionStatus.Pending, 2],
		[AffiliateComissionStatus.Paid, 1],
	])('query affiliate comissions by %s status', async (status, totalItems) => {
		const { data } = await environment.privateApiClient.query<
			AffiliateComissionQuery,
			AffiliateComissionQueryVariables
		>(AFFILIATE_COMISSIONS, {
			filter: {
				operator: FilterOperator.And,
				status,
			},
		});

		expect(data.affiliateComissions?.totalItems).toBe(totalItems);
		expect(data.affiliateComissions?.items).toEqual(
			allComissionsResult.filter((item) => item.status === status),
		);
	});

	it('query with pagination skip', async () => {
		const { data } = await environment.privateApiClient.query<
			AffiliateComissionQuery,
			AffiliateComissionQueryVariables
		>(AFFILIATE_COMISSIONS, {
			pagination: {
				skip: 1,
			},
		});

		expect(data.affiliateComissions?.totalItems).toBe(3);
		expect(data.affiliateComissions?.items).toEqual([
			allComissionsResult[1],
			allComissionsResult[2],
		]);
	});

	it('query with pagination skip and take', async () => {
		const { data } = await environment.privateApiClient.query<
			AffiliateComissionQuery,
			AffiliateComissionQueryVariables
		>(AFFILIATE_COMISSIONS, {
			pagination: {
				skip: 1,
				take: 1,
			},
		});

		expect(data.affiliateComissions?.totalItems).toBe(3);
		expect(data.affiliateComissions?.items).toEqual([allComissionsResult[1]]);
	});

	it('query with date_created inverted sort', async () => {
		const { data } = await environment.privateApiClient.query<
			AffiliateComissionQuery,
			AffiliateComissionQueryVariables
		>(AFFILIATE_COMISSIONS, {
			pagination: {
				sort: {
					date_created: SortOrder.Desc,
				},
			},
		});

		expect(data.affiliateComissions?.totalItems).toBe(3);
		expect(data.affiliateComissions?.items).toEqual(allComissionsResult.reverse());
	});

	it('see affiliateComissionCalcs', async () => {
		const { data } = await environment.privateApiClient.query<
			AffiliateComissionsCalcsQuery,
			AffiliateComissionsCalcsQueryVariables
		>(AFFILIATE_COMISSIONS_CALCS);

		expect(data.affiliateComissionsCalcs).toEqual({
			// this is tested at unit
			nextPaymentDate: expect.any(String),
			pendingAmountToReceive: 3,
			paidAmountByPeriod: expect.any(Number),
		} as AffiliateComissionsCalcsFragment);
	});

	it('see amount by period', async () => {
		// Create 2 new items for this suit
		const first = await environment.prisma.affiliate_comission.create({
			data: {
				amount: new Prisma.Decimal(130),
				affiliate: user.affiliate_affiliate_userTouser!.id,
				status: AffiliateComissionStatus.Paid,
			},
		});
		const second = await environment.prisma.affiliate_comission.create({
			data: {
				amount: new Prisma.Decimal(170),
				affiliate: user.affiliate_affiliate_userTouser!.id,
				status: AffiliateComissionStatus.Paid,
			},
		});
		// Set date_created for last month
		await environment.prisma.affiliate_comission.update({
			where: { id: first.id },
			data: { date_created: add(firstDayOfLastMonth(), { days: 10 }) },
		});
		await environment.prisma.affiliate_comission.update({
			where: { id: second.id },
			data: { date_created: sub(lastDayOfLastMonth(), { days: 2 }) },
		});

		const { data } = await environment.privateApiClient.query<
			AffiliateComissionsCalcsQuery,
			AffiliateComissionsCalcsQueryVariables
		>(AFFILIATE_COMISSIONS_CALCS, {
			// Query by last month
			from: firstDayOfLastMonth(),
			to: lastDayOfLastMonth(),
		});
		// Expect the sum of this both, not the rest
		expect(data.affiliateComissionsCalcs).toEqual(
			expect.objectContaining({
				paidAmountByPeriod: 300,
			} as AffiliateComissionsCalcsFragment),
		);
	});
});
