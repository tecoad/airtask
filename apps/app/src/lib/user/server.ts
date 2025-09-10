import { getApiClient } from '@/core/services/graphql/api/server';
import {
	MenuUserPermissionsFragment,
	MenuUserPermissionsQuery,
	MenuUserPermissionsQueryVariables,
} from '@/core/shared/gql-api-schema';
import { MENU_USER_PERMISSIONS } from '../sign/api-gql';

export const getSimplifiedUserInfos = async () => {
	try {
		const { data } = await getApiClient().query<
			MenuUserPermissionsQuery,
			MenuUserPermissionsQueryVariables
		>({
			query: MENU_USER_PERMISSIONS,
			context: {
				fetchOptions: {
					cache: 'no-store',
				},
			},
		});

		return data.activeUser;
	} catch (e) {
		return null;
	}
};

// TODO: When add multiple account, this should change
export const getUserSelectedAccount = (
	user: MenuUserPermissionsFragment,
): MenuUserPermissionsFragment['accounts'][number] => {
	return user.accounts[0];
};
