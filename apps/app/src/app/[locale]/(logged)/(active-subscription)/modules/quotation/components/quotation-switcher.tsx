'use client';

import * as React from 'react';

import { PopoverTrigger } from '@/components/ui/popover';

import Switcher, { ItemProps } from '@/components/switcher';
import { useListAccountQuotation } from '@/lib';
import { useParams } from 'next/navigation';
import { CreateNewQuotation } from './create-quotation';

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>;

interface QuotationSwitcherProps extends PopoverTriggerProps {}

export default function QuotationSwitcher({ className }: QuotationSwitcherProps) {
	const params = useParams();
	const activeItemId = Array.isArray(params.id) ? params.id[0] : params.id;

	const { data, isLoading } = useListAccountQuotation();

	const items = React.useMemo<ItemProps[]>(() => {
		if (!data) return [];
		return data.map((quotation) => ({
			id: quotation.id,
			title: quotation.title,
			path: `/modules/quotation/${quotation.id}/edit`,
			thumbPattern: quotation.status.toLowerCase(),
			group: quotation.status,
		}));
	}, [data]);

	return (
		<Switcher
			creation={{ component: <CreateNewQuotation /> }}
			items={items}
			isLoading={isLoading}
			{...(activeItemId && { activeItemId })}
		/>
	);
}
