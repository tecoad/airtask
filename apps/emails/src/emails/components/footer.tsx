import { Column, Container, Img, Row, Text } from '@react-email/components';
import React from 'react';
import { ENV } from '../../utils/env';
import { useTranslation } from '../../utils/i18n';
import { WithLanguageCode } from '../../utils/types';

const Footer = ({ languageCode }: WithLanguageCode) => {
	const { baseUrl } = ENV;

	const { t } = useTranslation('footer', {
		language: languageCode,
	});

	return (
		<Container className="px-6 lg:px-4">
			<Container className="mt-4 p-4 rounded-lg">
				<Row className="max-w-sm">
					<Column className="align-top">
						<Img
							src={`${baseUrl}/static/symbol-black.png`}
							width="20"
							alt="Airtask"
							className="mt-1"
						/>
					</Column>
					<Column className="pl-6">
						<Text className="text-black text-xs font-semibold m-0 leading-[18px]">
							Postless Tecnologia Serviços e Pagamentos Ltda
							<br />
							CNPJ 48.426.700/0001-79
						</Text>
						<Text className="text-[#666666] text-[11px] mt-1 mb-0  leading-[15px]">
							Av. Pref. Osmar Cunha, 416 Sala 1108, Centro
							<br />
							Florianópolis, SC - 88015-100
						</Text>
					</Column>
				</Row>
			</Container>

			<Text className="text-xs leading-1 text-center text-gray-500">{t('reason')}</Text>
		</Container>
	);
};

export default Footer;
