import { Text } from '@react-email/components';
import React, { ReactNode } from 'react';
import { Trans } from 'react-i18next';
import { useTranslation } from '../../utils/i18n';
import { WithLanguageCode } from '../../utils/types';
import ButtonSection from './button-section';
import Title from './title';

interface Props {
	title: ReactNode;
	subtitle?: ReactNode;
	note?: ReactNode;
	button?: {
		label: string;
		href: string;
	};
	postContent?: ReactNode;
	reachUsLinks?: boolean;
}

const StandardContent = ({
	title,
	subtitle,
	note,
	button,
	reachUsLinks = true,
	languageCode,
	postContent,
}: WithLanguageCode<Props>) => {
	const { t, i18n } = useTranslation('standardContent', {
		language: languageCode,
	});

	return (
		<>
			<Title>{title}</Title>
			<Text className="text-xl text-center">{subtitle}</Text>
			<Text className="text-center">{note}</Text>

			{button && <ButtonSection href={button.href} label={button.label} />}

			{postContent && <Text className="text-center">{postContent}</Text>}

			{reachUsLinks && (
				<Text>
					<Trans
						t={t}
						i18n={i18n}
						i18nKey="contactUs"
						components={[
							<strong />,
							<a
								href="mailto:help@airtask.ai"
								className="text-brand no-underline font-bold"
							/>,
							<a
								href="https://app.airtask.ai"
								className="text-brand no-underline font-bold"
							/>,
						]}
					/>
				</Text>
			)}
		</>
	);
};

export default StandardContent;
