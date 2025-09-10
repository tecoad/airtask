'use client';

import * as React from 'react';

import { PopoverTrigger } from '@/components/ui/popover';

import Switcher, { ItemProps } from '@/components/switcher';
import { useListFlowAgents } from '@/lib/flow-agent/hooks';
import { useParams } from 'next/navigation';
import { CreateNewAgent } from './create-agent';

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>;

interface AgentSwitcherProps extends PopoverTriggerProps {}

export default function AgentSwitcher({ className }: AgentSwitcherProps) {
	const params = useParams();
	const activeItemId = Array.isArray(params.id) ? params.id[0] : params.id;

	const { data, isLoading } = useListFlowAgents();

	const items = React.useMemo<ItemProps[]>(() => {
		if (!data) return [];
		return data.map((agent) => ({
			id: agent.id,
			title: agent.title,
			path: `/modules/flow/agents/${agent.id}/edit`,
			thumbPattern: agent.editor_type.toLowerCase(),
		}));
	}, [data]);

	return (
		<Switcher
			creation={{ component: <CreateNewAgent /> }}
			items={items}
			isLoading={isLoading}
			{...(activeItemId && { activeItemId })}
		/>
	);
}
