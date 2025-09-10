'use client';
import { apiClient } from '@/core/services/graphql';
import { Permissions } from '@/core/shared/admin-gql-api-schema';
import {
	AccountUsageKind,
	ActiveUserFragment,
	ActiveUserQuery,
	ActiveUserQueryVariables,
	OnBoardingStepName,
	RegisterOnboardingStepForAccountMutation,
	RegisterOnboardingStepForAccountMutationVariables,
	UserAccountFragment,
} from '@/core/shared/gql-api-schema';
import { ACTIVE_USER, LOGOUT_USER } from '@/lib/sign/api-gql';
import _ from 'lodash';
import { usePathname } from 'next/navigation';
import {
	Dispatch,
	ReactNode,
	SetStateAction,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import { REGISTER_ONBOARDING_STEP_FOR_ACCOUNT } from './api-gql';
import {
	IsAccountAllowedToModule,
	IsAccountSubscriptionActive,
	UserHasPermissions,
	setUserCookies,
} from './helpers';

type UserContextContent = {
	user?: ActiveUserFragment;
	isUserLoading: boolean;
	accountSelected: UserAccountFragment | undefined;
	setAccountSelected: Dispatch<SetStateAction<UserAccountFragment | undefined>>;
	fetchUser: (userInput?: ActiveUserFragment, preventCache?: boolean) => Promise<void>;
	logout: () => Promise<void>;
	isAccountAllowedToModule: (module: AccountUsageKind) => boolean;
	isAccountSubscriptionActive: () => boolean;
	userHasPermission: (permission: Permissions) => boolean;

	/**
	 * It will check if the account already has this step before register it,
	 * so you can call this function multiple times without worry about it
	 */
	registerOnboardingStepForAccount: (stepName: OnBoardingStepName) => Promise<void>;
};

const UserContext = createContext<UserContextContent>({} as UserContextContent);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({
	children,
	user: initialUser,
}: {
	children: ReactNode;
	user?: ActiveUserFragment;
}) => {
	const [isUserLoading, setUserLoading] = useState(true);
	const [user, setUser] = useState<ActiveUserFragment | undefined>(initialUser);
	const [accountSelected, setAccountSelected] = useState<UserAccountFragment>();

	const isAccountSubscriptionActive = useCallback(() => {
		return IsAccountSubscriptionActive(accountSelected ?? null);
	}, [accountSelected?.account.active_subscription]);

	const isAccountAllowedToModule = useCallback(
		(module: AccountUsageKind) => {
			return IsAccountAllowedToModule(module, accountSelected ?? null);
		},
		[isAccountSubscriptionActive, accountSelected?.allowed_modules],
	);

	const userHasPermission = useCallback(
		(perms: Permissions) => {
			return UserHasPermissions(user ?? null, perms);
		},
		[user?.permissions],
	);

	const fetchUser = useCallback(
		async (userInput?: ActiveUserFragment, preventCache = false) => {
			try {
				let user: ActiveUserFragment = userInput!;

				if (!user) {
					const { data } = await apiClient.query<
						ActiveUserQuery,
						ActiveUserQueryVariables
					>({
						query: ACTIVE_USER,
						variables: {},
						...(preventCache
							? {
									fetchPolicy: 'no-cache',
							  }
							: {}),
					});

					user = data.activeUser!;
				}

				setUserLoading(false);
				setUser(user);
				setAccountSelected(user.accounts[0]!);
				setUserCookies(user);
			} catch (e) {
				console.log(e);
			}
		},
		[],
	);

	const registerOnboardingStepForAccount = useCallback(
		async (stepName: OnBoardingStepName) => {
			if (
				!accountSelected ||
				accountSelected.account.concluded_onboarding_steps.find(
					(item) => item.name === stepName,
				)
			)
				return;

			try {
				const { data } = await apiClient.mutate<
					RegisterOnboardingStepForAccountMutation,
					RegisterOnboardingStepForAccountMutationVariables
				>({
					mutation: REGISTER_ONBOARDING_STEP_FOR_ACCOUNT,
					variables: {
						accountId: accountSelected.account.id,
						step: stepName,
					},
				});

				if (data?.registerOnboardingStepForAccount) {
					setAccountSelected((prev) => {
						const clone = _.cloneDeep(prev);

						if (!clone) return clone;

						clone.account.concluded_onboarding_steps.push(
							data.registerOnboardingStepForAccount!,
						);

						return clone;
					});
				}
			} catch (e) {
				console.log(e);
			}
		},
		[accountSelected, setAccountSelected],
	);

	const logout = useCallback(async () => {
		await apiClient.mutate({
			mutation: LOGOUT_USER,
		});

		setUser(undefined);
	}, []);

	const pathname = usePathname();
	useEffect(() => {
		!user && fetchUser(undefined, true).catch(console.log);
	}, [pathname]);

	return (
		<UserContext.Provider
			value={{
				user,
				isUserLoading,
				accountSelected,
				setAccountSelected,
				fetchUser,
				logout,
				userHasPermission,
				isAccountAllowedToModule,
				isAccountSubscriptionActive,
				registerOnboardingStepForAccount,
			}}>
			{children}
		</UserContext.Provider>
	);
};
