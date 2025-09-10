import { ActiveUserFragment } from '@/core/shared/gql-api-schema';

export const withUserEventData = (user: ActiveUserFragment) => ({
	user_data: {
		id: user.id,
		email_address: user.email,
		address: {
			firstname: user.first_name,
			lastname: user.last_name,
		},
	},
});
