import { Prisma } from '@prisma/client';

const collections: Prisma.ModelName[] = [
	'subscription',
	'quotation',
	'account_user',
	'account',
	'subscription',
	'subscription_plan',
	'quotation_question',
	'affiliate',
	'affiliate_comission',
	'subscription_plan_price',
];

export const mockPrisma = (): Record<
	(typeof collections)[number],
	ReturnType<typeof mockPrismaOperations>
> => {
	const orm: any = {};

	for (const entity of collections) {
		orm[entity] = mockPrismaOperations([]);
	}

	orm.$transaction = async (fn: any) => {
		return await fn(orm);
	};

	return orm;
};

export const mockPrismaOperations = (items: any | any[]) => {
	const manyResult = () => {
		return new Promise((res) => {
			res([...(Array.isArray(items) ? items : [items])]);
		});
	};

	const oneResult = () => {
		return new Promise((res) => {
			res(Array.isArray(items) ? items[0] : items);
		});
	};

	return {
		create: jest.fn(() => oneResult()),
		createMany: jest.fn(() => manyResult()),
		delete: jest.fn(() => oneResult()),
		update: jest.fn(() => oneResult()),
		updateMany: jest.fn(() => manyResult()),
		findMany: jest.fn(() => manyResult()),
		findFirst: jest.fn(() => oneResult()),
		findFirstOrThrow: jest.fn(() => oneResult()),
		findUnique: jest.fn(() => oneResult()),
		findUniqueOrThrow: jest.fn(() => oneResult()),
	};
};
