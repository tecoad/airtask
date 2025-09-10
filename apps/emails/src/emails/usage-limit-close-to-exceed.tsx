import React from 'react';
import { Trans } from 'react-i18next';
import { useTranslation } from '../utils/i18n';
import { EmailTemplateFunction } from '../utils/types';
import Layout from './components/layout';
import StandardContent from './components/standard-content';

export type UsageLimitCloseToExceedVariables = {
	usageKind: string;
	userFirstName: string;
	app_url: string;
};

export const UsageLimitCloseToExceedEmailTemplate: EmailTemplateFunction<UsageLimitCloseToExceedVariables> =
	{
		getSubject: ({ languageCode, usageKind }) => {
			const { t } = useTranslation('usageLimitCloseToExceed', { language: languageCode });
			return t('subject', { module: usageKind });
		},

		defaultProps: {
			languageCode: 'en',
			usageKind: 'Quotation',
			userFirstName: 'John',
		},
		template({ languageCode, usageKind, userFirstName, app_url }) {
			const { t, i18n } = useTranslation('usageLimitCloseToExceed', {
				language: languageCode,
			});

			return (
				<Layout languageCode={languageCode}>
					<StandardContent
						languageCode={languageCode}
						title={t('title', { name: userFirstName, module: usageKind })}
						subtitle={t('subtitle')}
						note={<Trans t={t} i18n={i18n} i18nKey="noticeAlert" components={[<br />]} />}
						button={{
							label: t('buyCredits'),
							href: app_url,
						}}
					/>
				</Layout>
			);
		},
	};

export default UsageLimitCloseToExceedEmailTemplate;
