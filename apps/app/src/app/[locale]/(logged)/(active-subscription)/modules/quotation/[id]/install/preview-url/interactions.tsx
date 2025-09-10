'use client';

import { CustomButton } from '@/components/custom-button';
import { SectionTitle } from '@/components/section-title';
import { Input } from '@/components/ui/input';
import { ENV } from '@/core/config/env';
import { ArrowUpRightSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Suspense, useState } from 'react';

export const PreviewUrlInteractions = ({ hash }: { hash: string }) => {
	const t = useTranslations('modules.install');
	const [inputValue, setInputValue] = useState('');
	const previewUrl = ENV.WIDGET.widget_preview_by_hash('quotation', hash, inputValue);

	const handleGoToPreviewUrl = () => {
		window.open(previewUrl, '_blank');
	};

	return (
		<>
			<SectionTitle
				title={t('previewWidget.title')}
				subtitle={t('previewWidget.description')}
			/>

			<div className="relative">
				<Suspense fallback={<Input className="is-skeleton w-full" />}>
					<div className="relative flex w-full flex-col gap-3  md:flex-row md:items-center">
						<div className="flex flex-grow flex-row items-center">
							<span className="text-foreground/30 mr-3">http://</span>
							<Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
						</div>
						<CustomButton
							size="sm"
							className="whitespace-nowrap p-3"
							onClick={handleGoToPreviewUrl}>
							{t('previewWidget.goToWebsite')}
							<ArrowUpRightSquare className="ml-2" size={18} strokeWidth={1.8} />
						</CustomButton>
					</div>
				</Suspense>
			</div>
		</>
	);
};
