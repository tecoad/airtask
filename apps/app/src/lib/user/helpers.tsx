// TODO THIS ALL FILE
/* eslint-disable react/display-name */
import { Permissions } from '@/core/shared/admin-gql-api-schema';
import {
	AccountUsageKind,
	ActiveUserFragment,
	UserAccountFragment,
} from '@/core/shared/gql-api-schema';
import { sanitizeEmail, sanitizeName } from '@/lib/sign/helpers';
import { CONSTANTS, COOKIE_CONFIG } from '@airtask/core/src/config';
import { setCookie } from 'nookies';
import { useUser } from './context';

const domain =
	process.env.NEXT_PUBLIC_COOKIE_DOMAIN || process.env.REACT_APP_COOKIE_DOMAIN;

export const withAccountAllowed = (
	module: AccountUsageKind,
	Component: (...props: any[]) => JSX.Element,
) => {
	return (props: any) => {
		const { isUserLoading, isAccountAllowedToModule } = useUser();

		if (isUserLoading) return <></>;

		return !isUserLoading && !isAccountAllowedToModule(module) ? (
			// <NotFoundPage
			// 	title="Oops!"
			// 	description="Parece que você está tentando acessar uma página que você não possui acesso."
			// />
			<></>
		) : (
			<Component {...props} />
		);
	};
};

export const withUserAllowedByPermission = (
	permission: Permissions,
	Component: (...props: any[]) => JSX.Element,
) => {
	return function NewComponent(props: any) {
		const { isUserLoading, userHasPermission } = useUser();

		if (isUserLoading) return <>Loading...</>;

		return !isUserLoading && !userHasPermission(permission) ? (
			// <NotFoundPage
			// 	title="Oops!"
			// 	description="Parece que você está tentando acessar uma página que você não possui acesso."
			// />
			<></>
		) : (
			<Component {...props} />
		);
	};
};

export const setUserCookies = (
	{
		email,
		first_name,
		last_name,
		anonymous_id,
		id,
	}: Pick<ActiveUserFragment, 'email' | 'first_name' | 'last_name' | 'anonymous_id'> & {
		id?: string;
	},
	updateAnonymousCookie: boolean = true,
) => {
	setCookie(
		undefined,
		CONSTANTS.COOKIES.firstName,
		sanitizeName(first_name),
		COOKIE_CONFIG,
	);
	setCookie(
		undefined,
		CONSTANTS.COOKIES.lastname,
		sanitizeName(last_name),
		COOKIE_CONFIG,
	);
	setCookie(undefined, CONSTANTS.COOKIES.email, sanitizeEmail(email), COOKIE_CONFIG);
	if (updateAnonymousCookie && anonymous_id) {
		setCookie(undefined, CONSTANTS.COOKIES.anonymousId, anonymous_id, COOKIE_CONFIG);
	}
	if (id) setCookie(undefined, CONSTANTS.COOKIES.id, id, COOKIE_CONFIG);
};

export const UserHasPermissions = (
	user: ActiveUserFragment | null,
	permission: Permissions,
) => {
	if (user?.permissions?.includes(Permissions.SuperAdmin)) return true;

	return user?.permissions.includes(permission) ?? false;
};

export const IsAccountSubscriptionActive = (
	accountSelected: UserAccountFragment | null,
) => {
	return !!accountSelected?.account?.active_subscription;
};

export const IsAccountAllowedToModule = (
	module: AccountUsageKind,
	accountSelected: UserAccountFragment | null,
) => {
	return (
		IsAccountSubscriptionActive(accountSelected || null) &&
		(accountSelected?.allowed_modules || []).includes(module)
	);
};
