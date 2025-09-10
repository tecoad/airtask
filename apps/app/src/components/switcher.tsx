'use client';

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { sanitizeName } from '@/lib/sign/helpers';
import { cn } from '@/lib/utils';

import { CustomButton } from '@/components/custom-button';
import { CONSTANTS } from '@/core/config/constants';
import { generateThumb } from '@/lib/colors';
import { Check, ChevronsUpDown, Loader2, PlusCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dispatch, SetStateAction, createContext, useContext, useState } from 'react';

export interface ItemProps {
	id: string;
	title: string;
	path: string;
	group?: string;
	thumbPattern?: 'enabled' | 'disabled' | string;
}

interface GroupProps {
	name: string;
	item: ItemProps[];
}

interface CreationProps {
	component: React.ReactNode;
}

interface Props {
	creation?: CreationProps;
	items?: ItemProps[];
	isLoading?: boolean;
	selectedId?: string;
	activeItemId?: string;
	limit?: number;
}

const SwitcherContext = createContext<{
	isCreateModalOpen: boolean;
	setIsCreateModalOpen: Dispatch<SetStateAction<boolean>>;
}>({} as any);

export const useSwitchContext = () => useContext(SwitcherContext);

const Switcher = ({ creation, items, isLoading, activeItemId, limit }: Props) => {
	const groups: GroupProps[] = items
		? Object.values(
				items.reduce((grouped: { [key: string]: GroupProps }, item) => {
					const key = item.group || 'undefined';
					if (!grouped[key]) {
						grouped[key] = { name: key, item: [] };
					}

					grouped[key].item.push(item);

					return grouped;
				}, {}),
		  ).sort((a, b) => {
				if (a.name === 'undefined') return 1;
				if (b.name === 'undefined') return -1;
				return 0;
		  })
		: [];

	const activeItem: ItemProps | null =
		activeItemId && items ? items.find((item) => item.id === activeItemId) ?? null : null;

	const router = useRouter();
	const t = useTranslations('modules');
	const [open, setOpen] = useState(false);

	const params = useSearchParams();

	const [isCreateModalOpen, setIsCreateModalOpen] = useState(
		!!params.get(CONSTANTS.queryParams.createNewDefaultOpen),
	);

	const [matches, setMatches] = useState(0);

	return (
		<div className="flex flex-row items-center gap-2 ">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<CustomButton
						variant="outline"
						role="combobox"
						aria-expanded={open}
						aria-label={t('searchItem')}
						className={cn('w-[200px] justify-between')}>
						<div
							className={cn(
								'knowledgebase-gradient mr-2 h-5 w-5 flex-shrink-0 rounded-full',
							)}
							style={{
								backgroundColor: activeItem?.thumbPattern
									? generateThumb(activeItem.thumbPattern)[0]
									: 'transparent',
							}}
						/>
						<div className="line-clamp-1  ">
							{activeItem ? activeItem.title : t('select')}
						</div>
						<ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
					</CustomButton>
				</PopoverTrigger>
				<PopoverContent className="w-[200px] p-0">
					<Command
						loop
						value={`${activeItem?.id} ${activeItem?.title}`}
						// filter={(value, search) => {
						// 	if (value.includes(search)) return 1;
						// 	return 0;
						// }}
					>
						{(groups?.length || 0) > 0 && !isLoading && (
							<CommandInput placeholder={t('searchItem')} />
						)}

						{groups?.length === 0 && !isLoading ? (
							<div className="py-4 text-center text-sm">{t('noInstance')}</div>
						) : (
							<CommandEmpty>{t('noInstanceSearch')}</CommandEmpty>
						)}

						{isLoading ? (
							<>
								<div className="flex flex-row items-center  justify-center p-4">
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								</div>
							</>
						) : (
							groups?.map((group) => (
								<>
									{group.name === 'undefined' && <CommandSeparator />}
									<CommandGroup
										key={group.name}
										heading={group.name !== 'undefined' && sanitizeName(group.name)}>
										{group.item.map((item) => (
											<CommandItem
												key={item.id}
												value={`${item.id} ${item.title}`}
												aria-selected="false"
												onSelect={() => {
													setOpen(false);
													router.push(item.path);
												}}
												className="cursor-pointer text-sm">
												<div
													className={cn(
														'knowledgebase-gradient mr-2 h-5 w-5 flex-shrink-0 rounded-full',
													)}
													style={{
														backgroundColor: item.thumbPattern
															? generateThumb(item.thumbPattern)[0]
															: 'transparent',
													}}
												/>
												<div className="line-clamp-2 leading-tight">{item.title}</div>
												<Check
													className={cn(
														'ml-auto h-4 w-4',
														activeItemId === item.id ? 'opacity-100' : 'opacity-0',
													)}
												/>
											</CommandItem>
										))}
									</CommandGroup>
								</>
							))
						)}
						{/* <CommandSeparator /> */}

						{creation && (
							<CommandGroup forceMount>
								<CommandItem
									className="cursor-pointer"
									value=""
									onSelect={() => {
										setOpen(false);
										setIsCreateModalOpen(true);
									}}>
									<PlusCircle className="mr-2 h-5 w-5" />
									{t('createNew')}
								</CommandItem>
							</CommandGroup>
						)}
					</Command>
				</PopoverContent>
			</Popover>

			<SwitcherContext.Provider value={{ isCreateModalOpen, setIsCreateModalOpen }}>
				{creation?.component}
			</SwitcherContext.Provider>
		</div>
	);
};

export default Switcher;
