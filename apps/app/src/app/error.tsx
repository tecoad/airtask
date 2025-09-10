'use client'; // Error components must be Client Components

import { BgImages } from '@/components/bg-images';
import { CustomButton } from '@/components/custom-button';
import PageContent from '@/components/page-content';
import { PageWrapper } from '@/components/page-wrapper';
import { Ban, RefreshCcw } from 'lucide-react';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
	useEffect(() => {
		// Log error to an error reporting service
		console.error(error);
	}, [error]);

	return (
		<>
			<PageWrapper>
				<PageContent centered>
					<div className="flex max-w-lg flex-col items-center gap-4">
						<div className="flex flex-row items-center gap-2 ">
							<Ban size={32} strokeWidth={1.75} />
							<h2 className="text-foreground text-4xl">{error.name}</h2>
						</div>
						<p className="text-center">{error.message}</p>
						<CustomButton
							variant="link"
							onClick={() => reset()}
							className="flex flex-row gap-2">
							<RefreshCcw size={16} strokeWidth={1.75} />
							Retry
						</CustomButton>
					</div>
				</PageContent>
			</PageWrapper>
			<BgImages />
		</>
	);
}
