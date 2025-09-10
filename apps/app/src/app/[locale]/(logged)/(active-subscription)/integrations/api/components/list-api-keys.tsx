'use client';

import { useListAccountApiKeys } from '@/lib/account-api-key/hooks';
import { useTranslations } from 'next-intl';
import { ApiKey } from './api-key';

export const ListApiKeys = () => {
	const { data, isLoading } = useListAccountApiKeys();
	const t = useTranslations('integrations.api.keys');

	return isLoading ? (
		<p>Loading...</p>
	) : (
		<div>
			<h1>API Keys</h1>
			<div className="flex flex-col-reverse items-center gap-6 ">
				{(data || []).map((apiKey) => (
					<ApiKey apiKey={apiKey} key={apiKey.id} />
				))}
			</div>
		</div>
	);
};
