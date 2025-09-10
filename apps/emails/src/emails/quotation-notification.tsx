import { Heading, Hr, Preview, Section, Text } from '@react-email/components';
import React from 'react';
import { Trans } from 'react-i18next';
import { useTranslation } from '../utils/i18n';
import { EmailTemplateFunction } from '../utils/types';
import Layout from './components/layout';
import Title from './components/title';

export type QuotationNotificationVariables = {
	user_firstname: string;
	requester_name: string;
	requester_email: string;
	requester_phone: string;
	questions: {
		question: string;
		answer: string;
	}[];
};

export const QuotationNotificationEmailTemplate: EmailTemplateFunction<QuotationNotificationVariables> =
	{
		getSubject: ({ languageCode, requester_name }) => {
			const { t } = useTranslation('quotationNotification', { language: languageCode });

			return t('subject', { name: requester_name });
		},
		defaultProps: {
			user_firstname: 'Matheus',
			languageCode: 'en',
			requester_name: 'Andre Solicitante',
			requester_email: 'solicitante@solicitante.com',
			requester_phone: '123123123',
			questions: [
				{
					question: 'Qual o serviço de interesse?',
					answer: 'Desenho de logomarca',
				},
				{
					question: 'Possui um deadline?',
					answer: 'Sim',
				},
				{
					question: 'Qual o deadline',
					answer: '24/12/2023',
				},
			],
		},

		template: ({
			languageCode,
			requester_name,
			user_firstname,
			questions,
			requester_email,
			requester_phone,
		}) => {
			const { t, i18n } = useTranslation('quotationNotification', {
				language: languageCode,
			});

			return (
				<Layout languageCode={languageCode}>
					<Preview>{t('subject', { name: requester_name })}</Preview>

					<Title>
						<Trans
							t={t}
							i18n={i18n}
							i18nKey="hello"
							values={{
								name: user_firstname,
							}}
							components={[<strong />]}
						/>
					</Title>

					<Heading className="text-2xl text-center my-[30px] text-brandDark !font-display">
						<Trans
							t={t}
							i18n={i18n}
							i18nKey="heading"
							values={{
								name: requester_name,
							}}
							components={[<span className="font-bold text-brand" />]}
						/>
					</Heading>

					<Section className="bg-gray-100 rounded-lg shadow-inner p-3 text-center">
						<Text className="text-black text-[14px] m-0 font-bold">
							{t('requestData.title')}
						</Text>

						<Text className="text-black text-[14px]  m-0">
							<Trans
								t={t}
								i18n={i18n}
								i18nKey="requestData.name"
								values={{
									name: requester_name,
								}}
								components={[<span className="font-bold" />]}
							/>
						</Text>

						<Text className="text-black text-[14px]  m-0">
							<Trans
								t={t}
								i18n={i18n}
								i18nKey="requestData.phone"
								values={{
									phone: requester_phone,
								}}
								components={[<span className="font-bold" />]}
							/>
						</Text>

						<Text className="text-black text-[14px] m-0">
							<Trans
								t={t}
								i18n={i18n}
								i18nKey="requestData.email"
								values={{
									email: requester_email,
								}}
								components={[<span className="font-bold" />]}
							/>
						</Text>
					</Section>

					<Section className="text-center mt-6">
						{questions.map((question) => (
							<Text className="text-black text-[14px] m-0">
								<span className="font-bold">{question.question}:</span> {question.answer}
							</Text>
						))}
					</Section>
					<Hr className="my-4" />

					<Text>{t('instructions')}</Text>
				</Layout>
			);
		},
	};

export default QuotationNotificationEmailTemplate;
