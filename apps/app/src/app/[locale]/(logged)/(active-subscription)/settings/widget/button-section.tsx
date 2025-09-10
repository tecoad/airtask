'use client';

import { useFormContext } from 'react-hook-form';

import { ColorInputField } from '@/components/forms/color-input';
import { ImageUploadField } from '@/components/forms/image-upload';
import { InputField } from '@/components/forms/input';
import { RowGrid } from '@/components/forms/row-grid';
import { SectionTitle } from '@/components/section-title';
import { WidgetSettingsFormValues } from '@/lib/settings';
import { useTranslations } from 'next-intl';

type Props = {
	skeletonMode: boolean;
};

export function ButtonSection({ skeletonMode }: Props) {
	const { control } = useFormContext<WidgetSettingsFormValues>();

	const t = useTranslations('settings.widget.buttonConfig');
	return (
		<>
			<SectionTitle title={t('title')} subtitle={t('subtitle')} separator="top" />

			<RowGrid>
				<InputField
					skeletonMode={skeletonMode}
					control={control}
					label={t('buttonText')}
					name="button_text"
				/>
				<InputField
					skeletonMode={skeletonMode}
					control={control}
					suffix="px"
					label={t('buttonFontSize')}
					name="button_font_size"
				/>
			</RowGrid>

			{/* <RowGrid>
				<InputField
					skeletonMode={skeletonMode}
					control={control}
					suffix="px"
					label={t('distanceFromBorder')}
					name="distance_from_border"
				/>
				<InputField
					skeletonMode={skeletonMode}
					control={control}
					suffix="px"
					label={t('buttonHeight')}
					name="button_size"
				/>
			</RowGrid> */}

			<RowGrid>
				<ColorInputField
					skeletonMode={skeletonMode}
					control={control}
					modes={['solid']}
					label={t('buttonColor')}
					name="button_color"
				/>
				<ColorInputField
					skeletonMode={skeletonMode}
					control={control}
					modes={['solid']}
					label={t('buttonIconColor')}
					name="button_icon_color"
				/>
				{/* <ColorInputField
					skeletonMode={skeletonMode}
					control={control}
					modes={['solid']}
					label={t('buttonTextColor')}
					name="button_text_color"
					className="col-span-6 md:col-span-2"
				/> */}
			</RowGrid>

			<ImageUploadField
				formKey="icon"
				assetFormKey="icon_Asset"
				control={control}
				title={t('icon.title')}
				description={t('icon.description')}
				dropzoneSettings={{
					accept: {
						'image/*': ['.svg', '.png', '.jpg', '.jpeg', '.webp'],
					},
				}}
			/>
		</>
	);
}
