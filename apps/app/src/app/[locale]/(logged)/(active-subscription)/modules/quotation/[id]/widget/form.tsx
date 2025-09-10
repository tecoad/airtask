'use client';

import { WidgetForm } from '@/app/[locale]/(logged)/(active-subscription)/settings/widget/widget-form';
import { AccountUsageKind } from '@/core/shared/gql-api-schema';
import { useParams } from 'next/navigation';

export const Form = ({ fontsNameList }: { fontsNameList: string[] }) => {
	const { id } = useParams();

	return (
		<WidgetForm
			fontsNameList={fontsNameList}
			mode={{
				customModule: AccountUsageKind.Quotation,
				instanceId: id as string,
			}}
		/>
	);
};
