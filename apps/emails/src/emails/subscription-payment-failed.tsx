import React from 'react';
import { Trans } from 'react-i18next';
import { useTranslation } from '../utils/i18n';
import { EmailTemplateFunction } from '../utils/types';
import Layout from './components/layout';
import StandardContent from './components/standard-content';

export type SubscriptionPaymentFailedVariables = {
	firstname: string;
	app_url: string;
};

export const SubscriptionPaymentFailedEmailTemplate: EmailTemplateFunction<SubscriptionPaymentFailedVariables> =
	{
		getSubject: ({ languageCode }) => {
			const { t } = useTranslation('subscriptionPaymentFailed', {
				language: languageCode,
			});
			return t('subject');
		},

		defaultProps: {
			languageCode: 'en',
			firstname: 'John',
		},
		template({ languageCode, firstname, app_url }) {
			const { t, i18n } = useTranslation('subscriptionPaymentFailed', {
				language: languageCode,
			});

			return (
				<Layout languageCode={languageCode}>
					<StandardContent
						languageCode={languageCode}
						title={t('title')}
						subtitle={
							<Trans
								t={t}
								i18n={i18n}
								i18nKey="notAbleToCharge"
								values={{
									name: firstname,
								}}
								components={[<strong />]}
							/>
						}
						note={
							<Trans
								t={t}
								i18n={i18n}
								i18nKey="reviewInfo"
								components={[<br />, <strong />]}
							/>
						}
						button={{
							label: t('reviewAccount'),
							href: app_url,
						}}
						postContent={
							<Trans
								t={t}
								i18n={i18n}
								i18nKey="warning"
								components={[<strong />, <br />]}
							/>
						}
						reachUsLinks={false}
					/>
				</Layout>
			);
		},
	};

export default SubscriptionPaymentFailedEmailTemplate;
