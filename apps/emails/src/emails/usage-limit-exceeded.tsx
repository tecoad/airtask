import React from 'react';
import { useTranslation } from '../utils/i18n';
import { EmailTemplateFunction } from '../utils/types';
import Layout from './components/layout';
import StandardContent from './components/standard-content';

export type UsageLimitExceededVariables = {
	usageKind: string;
	userFirstName: string;
	app_url: string;
};

export const UsageLimitExceededEmailTemplate: EmailTemplateFunction<UsageLimitExceededVariables> =
	{
		getSubject: ({ languageCode, usageKind }) => {
			const { t } = useTranslation('usageLimitExceeded', { language: languageCode });
			return t('subject', { module: usageKind });
		},

		defaultProps: {
			languageCode: 'en',
			usageKind: 'Quotation',
			userFirstName: 'John',
		},
		template({ languageCode, usageKind, userFirstName, app_url }) {
			const { t } = useTranslation('usageLimitExceeded', {
				language: languageCode,
			});

			return (
				<Layout languageCode={languageCode}>
					<StandardContent
						languageCode={languageCode}
						title={t('title', { name: userFirstName })}
						subtitle={t('subtitle', { module: usageKind })}
						note={t('instructions')}
						button={{
							label: t('managePlan'),
							href: app_url,
						}}
					/>
				</Layout>
			);
		},
	};

export default UsageLimitExceededEmailTemplate;
