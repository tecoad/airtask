'use client';
import { Eye } from 'lucide-react';

import { useUser } from '@/lib';
import { useAdminSimulationMode, useListUsers } from '@/lib/admin-users';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Switcher from './switcher';

export default function AdminUserSwitcher() {
	const t = useTranslations('header');
	const { user } = useUser();
	const { data, setSearch, isLoading } = useListUsers();
	const { exec } = useAdminSimulationMode();

	return (
		<motion.div
			className="flex w-full justify-center"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}>
			<Switcher
				isLoading={isLoading}
				values={(data?.items || []).map((v) => ({
					id: v.id,
					label: `${v.first_name} ${v.last_name}`,
				}))}
				defaultValue={
					user && {
						id: user?.id,
						label: `${user?.first_name} ${user?.last_name}`,
					}
				}
				icon={
					<Eye size={16} strokeWidth={2} className="text-foreground/90 flex-shrink-0" />
				}
				searchPlaceholder={t('searchUserPlaceholder')}
				enableSearch={true}
				onSearch={setSearch}
				onChange={(v) => {
					exec(v.id);
				}}
			/>
		</motion.div>
	);
}
