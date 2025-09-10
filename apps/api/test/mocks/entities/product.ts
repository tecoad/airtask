import { faker } from '@faker-js/faker';
import { Prisma, product } from '@prisma/client';
import { CurrencyCode } from 'src/graphql';
import { XmlVariant } from 'src/modules/products-sync/utils/normalize';
import { ProductStatus } from 'src/shared/types/db';

export const mockProduct = (input?: Partial<product>): product => ({
	id: faker.datatype.number(),
	availability: 'in stock',
	currency: CurrencyCode.BRL,
	date_created: faker.date.past(),
	date_updated: faker.date.past(),
	description: faker.lorem.paragraph(),
	external_id: faker.datatype.number().toString(),
	feed_created: faker.datatype.number(),
	feed_last_updated: faker.datatype.number(),
	link: faker.internet.url(),
	merchant: faker.datatype.number(),
	price: new Prisma.Decimal(faker.datatype.number()),
	product_category: faker.datatype.number(),
	status: ProductStatus.Active,
	strength: faker.datatype.number(),
	title: faker.lorem.sentence(),
	user_created: null,
	user_updated: null,
	...input,
});

export const mockXmlVariant = (input?: Partial<XmlVariant>): XmlVariant => ({
	id: faker.datatype.number().toString(),
	availability: 'in_stock',
	currency: CurrencyCode.BRL,
	description: faker.lorem.paragraph(),
	link: faker.internet.url(),
	name: faker.lorem.sentence(),
	price: faker.datatype.number(),
	product_id: faker.datatype.number().toString(),
	...input,
});
