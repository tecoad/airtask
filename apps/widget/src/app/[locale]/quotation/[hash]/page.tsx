import { getQuotationByServer } from '@/containers/widget/server-hooks';

import { cookies } from 'next/headers';
import { QuotationConversation } from './quotation-conversation';

type Props = {
	params: { hash: string };
};

export default async function Page({ params }: Props) {
	const { data, error } = await getQuotationByServer(params.hash);

	return (
		<QuotationConversation
			data={data}
			error={error}
			themeCookieValue={cookies().get('widgetTheme')?.value as 'dark'}
		/>
	);
}
