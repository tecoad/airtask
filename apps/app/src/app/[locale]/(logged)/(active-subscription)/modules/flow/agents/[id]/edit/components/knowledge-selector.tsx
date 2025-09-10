'use client';

import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import { PopoverProps } from '@radix-ui/react-popover';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { unique } from '@/core/helpers/array';
import { useMutationObserver } from '@/core/hooks/useMutationObserver';
import { KnowledgeBaseFragment } from '@/core/shared/gql-api-schema';
import { FlowAgentFormValues } from '@/lib/flow-agent/hooks';
import { useListKnowledgeBases } from '@/lib/knowledge/hooks';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Controller, useFormContext } from 'react-hook-form';

interface KnowledgeSelectorProps extends PopoverProps {}

export function KnowledgeSelector({ ...props }: KnowledgeSelectorProps) {
	const [open, setOpen] = React.useState(false);
	const { control, watch } = useFormContext<FlowAgentFormValues>();
	const knowledBase = watch('_hydratedKnowledgeBase');
	const [peekedModel, setPeekedModel] = React.useState<KnowledgeBaseFragment>();
	const { data: _data, isLoading } = useListKnowledgeBases();
	const data = React.useMemo(() => {
		return unique([...(_data || []), ...(knowledBase ? [knowledBase] : [])], 'id');
	}, [_data, knowledBase?.id]);

	const t = useTranslations('flow.agents.editor.knowledgeBase');

	return (
		<Controller
			control={control}
			name="knowledge_base_id"
			render={({ field }) => (
				<div className="grid gap-2">
					<HoverCard openDelay={200}>
						<HoverCardTrigger asChild>
							<Label htmlFor="knowledge">{t('label')}</Label>
						</HoverCardTrigger>
						<HoverCardContent align="start" className="w-[260px] text-sm" side="left">
							{t('description')}
						</HoverCardContent>
					</HoverCard>
					<Popover open={open} onOpenChange={setOpen} {...props}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								role="combobox"
								aria-expanded={open}
								aria-label={t('selectBase')}
								className="w-full justify-between">
								{field.value
									? data?.find((item) => item.id === field.value)?.title
									: t('selectBase')}
								<CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent align="end" className="w-[250px] p-0">
							<HoverCard>
								{peekedModel && (
									<HoverCardContent
										side="left"
										align="start"
										forceMount
										className="min-h-[120px]">
										<div className="grid gap-2">
											<h4 className="font-medium leading-none">{peekedModel.title}</h4>
											<div className="mt-4 grid gap-2">
												<h5 className="text-sm font-medium leading-none">Questions</h5>
												<ul className="text-muted-foreground text-sm">
													{peekedModel.qa.length}
												</ul>
											</div>
										</div>
									</HoverCardContent>
								)}
								<Command loop>
									<CommandList className="h-[var(--cmdk-list-height)] max-h-[400px]">
										<CommandInput placeholder={t('searchBase')} />
										<CommandEmpty>{t('notFound')}</CommandEmpty>
										<HoverCardTrigger />
										{isLoading ? (
											<div className="flex flex-row items-center  justify-center p-4">
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											</div>
										) : (
											<CommandGroup>
												{data?.map((base) => (
													<BaseItem
														key={base.id}
														base={base}
														isSelected={field.value === base.id}
														onPeek={(base) => setPeekedModel(base)}
														onSelect={() => {
															field.onChange(base.id);
															setOpen(false);
														}}
													/>
												))}
											</CommandGroup>
										)}

										{/* <CommandGroup forceMount>
											<CommandItem className="cursor-pointer" value="">
												<PlusCircle className="mr-2 h-5 w-5" />
												{t('createNew')}
											</CommandItem>
										</CommandGroup> */}
									</CommandList>
								</Command>
							</HoverCard>
						</PopoverContent>
					</Popover>
				</div>
			)}
		/>
	);
}

interface BaseItemProps {
	base: KnowledgeBaseFragment;
	isSelected: boolean;
	onSelect: () => void;
	onPeek: (base: KnowledgeBaseFragment) => void;
}

function BaseItem({ base, isSelected, onSelect, onPeek }: BaseItemProps) {
	const ref = React.useRef<HTMLDivElement>(null);

	useMutationObserver(ref, (mutations) => {
		for (const mutation of mutations) {
			if (mutation.type === 'attributes') {
				if (mutation.attributeName === 'aria-selected') {
					onPeek(base);
				}
			}
		}
	});

	return (
		<CommandItem
			key={base.id}
			onSelect={onSelect}
			ref={ref}
			className="aria-selected:bg-primary aria-selected:text-primary-foreground">
			{base.title}
			<CheckIcon
				className={cn('ml-auto h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')}
			/>
		</CommandItem>
	);
}
