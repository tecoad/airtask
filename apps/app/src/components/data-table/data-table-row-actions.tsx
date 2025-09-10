'use client';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SettingsIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { CustomButton } from '../custom-button';

type Props = {
	title: string;
	items: ReactNode;
};

export function DataTableActions({ title, items }: Props) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<CustomButton
					variant="ghost"
					className="data-[state=open]:bg-muted flex h-8 w-8 p-0">
					<SettingsIcon className="h-4 w-4" />
				</CustomButton>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[160px]">
				{items}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
