import React from 'react';
import { Trans } from 'react-i18next';
import { useTranslation } from '../utils/i18n';
import { EmailTemplateFunction } from '../utils/types';
import Layout from './components/layout';
import StandardContent from './components/standard-content';

export type VerifyEmailVariables = { action_link: string };

export const VerifyEmailTemplate: EmailTemplateFunction<VerifyEmailVariables> = {
	getSubject: ({ languageCode }) => {
		const { t } = useTranslation('verifyEmail', { language: languageCode });

		return t('subject');
	},
	defaultProps: {
		languageCode: 'en',
		action_link: 'https://example.com',
	},
	template({ languageCode, action_link }) {
		const { t, i18n } = useTranslation('verifyEmail', { language: languageCode });

		return (
			<Layout languageCode={languageCode}>
				<StandardContent
					languageCode={languageCode}
					title={t('title')}
					subtitle={
						<Trans
							t={t}
							i18n={i18n}
							i18nKey="verifyEmailAccess"
							values={{
								link: action_link,
							}}
							components={[
								<a href={action_link} className="text-brand no-underline font-bold" />,
							]}
						/>
					}
					note={
						<Trans t={t} i18n={i18n} i18nKey="noticeAlert" components={[<strong />]} />
					}
					button={{
						label: t('accessAccount'),
						href: action_link,
					}}
				/>
			</Layout>
		);
	},
};

export default VerifyEmailTemplate;
