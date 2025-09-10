import { faker } from '@faker-js/faker';
import { WidgetConfigInput } from 'test/shared/test-gql-private-api-schema.ts';

export const mockWidgetConfigInput = (input?: WidgetConfigInput): WidgetConfigInput => ({
	allowed_domains: [faker.internet.domainName()],
	// Assets should be real ids
	avatar: null,
	icon: null,
	button_color: faker.internet.color(),
	button_text: faker.lorem.words(),
	button_text_color: faker.internet.color(),
	button_font_size: faker.random.numeric(),
	button_icon_color: faker.internet.color(),
	button_size: faker.datatype.number(),
	distance_from_border: faker.datatype.number(),
	font_size: faker.datatype.number(),
	google_font: faker.lorem.word(),
	width: faker.random.numeric(),
	height: faker.random.numeric(),
	hide_powered_by: faker.datatype.boolean(),
	initially_open: faker.datatype.boolean(),
	main_color: faker.internet.color(),
	position: faker.lorem.word(),
	title: faker.lorem.words(),
	...input,
});
