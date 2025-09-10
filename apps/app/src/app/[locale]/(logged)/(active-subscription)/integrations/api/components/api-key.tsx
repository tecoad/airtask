import { MomentDate } from '@/components/moment-date';
import { AccountApiKeyFragment } from '@/core/shared/gql-api-schema';
import { useTranslations } from 'next-intl';
import { DeleteApiKey } from './delete-api-key';

export const ApiKey = ({ apiKey }: { apiKey: AccountApiKeyFragment }) => {
	const t = useTranslations('integrations.api.keys');

	return (
		<div className="flex w-full items-center gap-5" key={apiKey.id}>
			<div>Nome: {apiKey.name || t('unnamedPlaceholder')}</div>
			<div>Key: {apiKey.maskedToken}</div>
			<div>
				<MomentDate
					prepend={'Criado em: '}
					date={new Date(apiKey.date_created)}
					mode="formatted"
				/>
			</div>
			<div>
				<DeleteApiKey data={apiKey} />
			</div>
		</div>
	);
};
