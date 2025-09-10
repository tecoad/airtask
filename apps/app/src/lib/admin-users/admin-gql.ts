import { gql } from '@apollo/client';
import { USER_FOR_ADMIN_FRAGMENT } from './admin-fragments';

export const LIST_USERS = gql`
	query Users($pagination: PaginatedUsersListOptions, $filter: UsersListFilter) {
		users(pagination: $pagination, filter: $filter) {
			items {
				...UserForAdmin
			}
			totalItems
		}
	}
	${USER_FOR_ADMIN_FRAGMENT}
`;

export const SIMULATE_USER = gql`
	mutation StartSimulationMode($focusUserId: ID!) {
		startSimulationMode(focusUserId: $focusUserId) {
			id
		}
	}
`;
