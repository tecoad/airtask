export const mockStripe = () => ({
	subscriptions: {
		retrieve: jest.fn(),
	},
	webhooks: {
		constructEvent: jest.fn(),
	},
	checkout: {
		sessions: {
			retrieve: jest.fn(),
		},
	},
	customers: {
		search: jest.fn(),
	},
});
