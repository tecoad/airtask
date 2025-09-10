import { Text } from '@react-email/components';
import React from 'react';
import { useTranslation } from '../utils/i18n';
import { EmailTemplateFunction } from '../utils/types';
import Layout from './components/layout';

export type ImportFlowContactsResultVariables = {
	totalItems: number;
	successItems: number;
	failedItems: number;
};

export const ImportFlowContactsResultEmailTemplate: EmailTemplateFunction<ImportFlowContactsResultVariables> =
	{
		getSubject: ({ languageCode }) => {
			const { t } = useTranslation('subscriptionPaymentFailed', {
				language: languageCode,
			});
			return t('subject');
		},
		defaultProps: {
			languageCode: 'en',
		},
		template({ languageCode, totalItems }) {
			return (
				<Layout languageCode={languageCode}>
					<Text>Total items: {totalItems}</Text>
				</Layout>
			);
		},
	};

export default ImportFlowContactsResultEmailTemplate;
