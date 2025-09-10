import { Permissions } from '@/core/shared/admin-gql-api-schema';
import { useUser } from '@/lib';
import { AnimatePresence } from 'framer-motion';
import React from 'react';
import { useSidebar } from '../providers/sidebar-provider';
import AdminUserSwitcher from './admin-user-switcher';
import LanguageSwitcher from './language-switcher';
import { ThemeToggler } from './theme-toggler';

interface Props {}

export const BottomItems: React.FC<Props> = () => {
	const { sidebarVisible } = useSidebar();
	const { userHasPermission } = useUser();

	return (
		<div className={`flex flex-col gap-2 ${sidebarVisible && 'mx-auto w-64'}`}>
			<AnimatePresence>
				{userHasPermission(Permissions.SuperAdmin) && <AdminUserSwitcher />}
			</AnimatePresence>

			<ThemeToggler />
			<LanguageSwitcher />
		</div>
	);
};
