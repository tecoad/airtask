'use client';

import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDisabled } from '@/core/contexts/disabled-provider';
import { cn } from '@/lib/utils';
import { Paintbrush } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { CustomButton } from './custom-button';

export type PickerMode = 'solid' | 'gradient' | 'image';

export interface PickerProps {
	background?: string;
	setBackground: (background: string) => void;
	className?: string;
	modes: PickerMode[];
}

export function GradientPicker({
	background,
	modes,
	setBackground,
	className,
}: PickerProps) {
	const disabled = useDisabled();
	const t = useTranslations('ui.colorPicker');

	const solids = [
		'#E2E2E2',
		'#ff75c3',
		'#ffa647',
		'#ffe83f',
		'#9fff5b',
		'#70e2ff',
		'#cd93ff',
		'#09203f',
	];

	const gradients = [
		'linear-gradient(to top left,#accbee,#e7f0fd)',
		'linear-gradient(to top left,#d5d4d0,#d5d4d0,#eeeeec)',
		'linear-gradient(to top left,#000000,#434343)',
		'linear-gradient(to top left,#09203f,#537895)',
		'linear-gradient(to top left,#AC32E4,#7918F2,#4801FF)',
		'linear-gradient(to top left,#f953c6,#b91d73)',
		'linear-gradient(to top left,#ee0979,#ff6a00)',
		'linear-gradient(to top left,#F00000,#DC281E)',
		'linear-gradient(to top left,#00c6ff,#0072ff)',
		'linear-gradient(to top left,#4facfe,#00f2fe)',
		'linear-gradient(to top left,#0ba360,#3cba92)',
		'linear-gradient(to top left,#FDFC47,#24FE41)',
		'linear-gradient(to top left,#8a2be2,#0000cd,#228b22,#ccff00)',
		'linear-gradient(to top left,#40E0D0,#FF8C00,#FF0080)',
		'linear-gradient(to top left,#fcc5e4,#fda34b,#ff7882,#c8699e,#7046aa,#0c1db8,#020f75)',
		'linear-gradient(to top left,#ff75c3,#ffa647,#ffe83f,#9fff5b,#70e2ff,#cd93ff)',
	];

	const images = [
		'url(https://images.unsplash.com/photo-1691200099282-16fd34790ade?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=90)',
		'url(https://images.unsplash.com/photo-1691226099773-b13a89a1d167?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=90',
		'url(https://images.unsplash.com/photo-1688822863426-8c5f9b257090?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=90)',
		'url(https://images.unsplash.com/photo-1691225850735-6e4e51834cad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=90)',
	];

	const modeMappings = {
		solid: solids,
		gradient: gradients,
		image: images,
	};

	const defaultTab = useMemo(() => {
		if (background?.includes('url')) return 'image';
		if (background?.includes('gradient')) return 'gradient';
		return 'solid';
	}, [background]);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<CustomButton
					variant={'outline'}
					className={cn(
						'w-[220px] justify-start text-left font-normal',
						!background && 'text-muted-foreground',
						className,
					)}
					disabled={disabled}>
					<div className="flex w-full items-center gap-2">
						{background ? (
							<div
								className="h-4 w-4 rounded !bg-cover !bg-center transition-all"
								style={{ background }}></div>
						) : (
							<Paintbrush className="h-4 w-4" />
						)}
						<div className="flex-1 truncate">
							{background ? background : t('pickColor')}
						</div>
					</div>
				</CustomButton>
			</PopoverTrigger>
			<PopoverContent className="w-64">
				<Tabs defaultValue={defaultTab} className="w-full">
					{modes && modes.length > 1 && (
						<TabsList className="mb-4 w-full">
							{modes &&
								modes.map((mode, key) => (
									<TabsTrigger className="flex-1" value={mode} key={key}>
										{mode}
									</TabsTrigger>
								))}
						</TabsList>
					)}
					{modes.map((mode, key) => (
						<TabsContent value={mode} className="mt-0 flex flex-wrap gap-1" key={key}>
							{modeMappings[mode].map((s) => (
								<div
									key={s}
									style={{ background: s }}
									className="h-6 w-6 cursor-pointer rounded-md active:scale-105"
									onClick={() => setBackground(s)}
								/>
							))}
						</TabsContent>
					))}

					<TabsContent value="password">Change your password here.</TabsContent>
				</Tabs>

				<Input
					id="custom"
					value={background}
					className="col-span-2 mt-4 h-8"
					disabled={disabled}
					onChange={(e) => setBackground(e.currentTarget.value)}
				/>
			</PopoverContent>
		</Popover>
	);
}
