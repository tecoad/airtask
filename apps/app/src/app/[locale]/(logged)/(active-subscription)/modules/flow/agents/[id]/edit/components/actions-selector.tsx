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

import { useMutationObserver } from '@/core/hooks/useMutationObserver';
import { PlusCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Action, ActionType } from '../data/actions';

interface ActionsSelectorProps extends PopoverProps {
	types: readonly ActionType[];
	actions: Action[];
}

export function ActionsSelector({ actions, types, ...props }: ActionsSelectorProps) {
	const [open, setOpen] = React.useState(false);
	const [selectedActions, setSelectedActions] = React.useState<Action[]>([]);
	const [peekedAction, setPeekedAction] = React.useState<Action>(actions[0]);

	const t = useTranslations('flow.agents.editor.actions');

	return (
		<div className="grid gap-2">
			<HoverCard openDelay={200}>
				<HoverCardTrigger asChild>
					<Label>{t('label')}</Label>
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
						aria-label={t('selectAction')}
						className="w-full justify-between">
						{t('selectedAction', { count: selectedActions.length })}
						<CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent align="end" className="w-[250px] p-0">
					<HoverCard>
						<HoverCardContent
							side="left"
							align="start"
							forceMount
							className="min-h-[150px]">
							<div className="grid gap-2">
								<h4 className="font-medium leading-none">{peekedAction.name}</h4>
								<div className="text-muted-foreground text-sm">{peekedAction.type}</div>
								<div className="mt-4 grid gap-2">
									<h5 className="text-sm font-medium leading-none">Trigger</h5>
									<ul className="text-muted-foreground text-sm">
										{peekedAction.trigger}
									</ul>
								</div>
							</div>
						</HoverCardContent>
						<Command loop>
							<CommandList className="h-[var(--cmdk-list-height)] max-h-[400px]">
								<CommandInput placeholder="Search Actions..." />
								<CommandEmpty>{t('noActions')}</CommandEmpty>
								<HoverCardTrigger />
								{types.map((type) => {
									// Prefiltering the actions for a specific type
									const filteredActions = actions.filter(
										(action) => action.type === type,
									);

									return (
										// Rendering the CommandGroup if there are any filtered actions
										filteredActions.length > 0 && (
											<CommandGroup key={type} heading={type}>
												{filteredActions.map((action) => (
													<ActionItem
														key={action.id}
														action={action}
														isSelected={selectedActions.includes(action)}
														onPeek={(action) => setPeekedAction(action)}
														onSelect={() => {
															const isAlreadySelected = selectedActions.includes(action);
															setSelectedActions(
																isAlreadySelected
																	? selectedActions.filter((a) => a.id !== action.id) // if already selected, remove it from selected
																	: [...selectedActions, action], // if not, add it to selected
															);
														}}
													/>
												))}
											</CommandGroup>
										)
									);
								})}

								<CommandGroup forceMount>
									<CommandItem className="cursor-pointer" value="">
										<PlusCircle className="mr-2 h-5 w-5" />
										{t('createNew')}
									</CommandItem>
								</CommandGroup>
							</CommandList>
						</Command>
					</HoverCard>
				</PopoverContent>
			</Popover>
		</div>
	);
}

interface ActionItemProps {
	action: Action;
	isSelected: boolean;
	onSelect: () => void;
	onPeek: (action: Action) => void;
}

function ActionItem({ action, isSelected, onSelect, onPeek }: ActionItemProps) {
	const ref = React.useRef<HTMLDivElement>(null);

	useMutationObserver(ref, (mutations) => {
		for (const mutation of mutations) {
			if (mutation.type === 'attributes') {
				if (mutation.attributeName === 'aria-selected') {
					onPeek(action);
				}
			}
		}
	});

	return (
		<CommandItem
			key={action.id}
			onSelect={onSelect}
			ref={ref}
			className="aria-selected:bg-primary aria-selected:text-primary-foreground cursor-pointer">
			{action.name}
			<CheckIcon
				className={cn('ml-auto h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')}
			/>
		</CommandItem>
	);
}
