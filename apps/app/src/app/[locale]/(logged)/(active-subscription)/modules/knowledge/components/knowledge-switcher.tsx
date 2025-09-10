'use client';

import * as React from 'react';

import { PopoverTrigger } from '@/components/ui/popover';

import Switcher from '@/components/switcher';
import { useListKnowledgeBases } from '@/lib/knowledge/hooks';
import { useParams } from 'next/navigation';
import { CreateNewKnowledgeBase } from './create-knowledge';

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>;

interface KnowledgeSwitcherProps extends PopoverTriggerProps {}

export default function KnowledgeSwitcher({ className }: KnowledgeSwitcherProps) {
	const params = useParams();
	const activeItemId = Array.isArray(params.id) ? params.id[0] : params.id;
	const { data, isLoading } = useListKnowledgeBases();

	return (
		<Switcher
			isLoading={isLoading}
			creation={{ component: <CreateNewKnowledgeBase /> }}
			items={data?.map((v) => ({
				id: v.id,
				title: v.title,
				path: `/modules/knowledge/${v.id}/edit`,
				thumbPattern: v.id,
			}))}
			{...(activeItemId && { activeItemId })}
		/>
	);
}
