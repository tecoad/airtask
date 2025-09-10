'use client';
import bgDark from '@/components/assets/bg-dark.png';
import bgWhite from '@/components/assets/bg-white.png';
import Image from 'next/image';
import { useSidebar } from './providers/sidebar-provider';

export const BgImages = () => {
	const { sidebarVisible } = useSidebar();

	return (
		<div
			className={`pointer-events-none absolute inset-x-0 ${
				sidebarVisible ? '-top-80' : 'top-0'
			} -z-10 flex justify-center overflow-hidden transition-all`}>
			<div className="flex w-[108rem] flex-none justify-end">
				<Image
					src={bgWhite}
					alt="bg"
					className="w-[71.75rem] max-w-none flex-none dark:hidden"
				/>
				<Image
					src={bgDark}
					alt="bg-dark"
					className="hidden w-[90rem] max-w-none flex-none dark:block"
				/>
			</div>
		</div>
	);
};
