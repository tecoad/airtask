'use client';

import { CardToggleField } from '@/components/forms/card-toggle';
import { ColorInputField } from '@/components/forms/color-input';
import { ImageUploadField } from '@/components/forms/image-upload';
import { InputField } from '@/components/forms/input';
import { InputListField } from '@/components/forms/input-list';
import { PopoverSelectField } from '@/components/forms/popover-select';
import { RowGrid } from '@/components/forms/row-grid';
import { SelectField } from '@/components/forms/select';
import { SectionTitle } from '@/components/section-title';
import { WidgetTheme } from '@/core/shared/gql-api-schema';
import { WidgetSettingsFormValues } from '@/lib/settings';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

type Props = {
	fontsNameList: string[];
	skeletonMode: boolean;
};

export function WindowSection({ fontsNameList, skeletonMode }: Props) {
	const { control, watch } = useFormContext<WidgetSettingsFormValues>();

	const allowedDomains = watch('allowed_domains');

	const t = useTranslations('settings.widget.windowConfig');

	return (
		<>
			<SectionTitle title={t('title')} subtitle={t('subtitle')} separator="bottom" />

			<InputField
				skeletonMode={skeletonMode}
				control={control}
				label={t('widgetTitle')}
				name="title"
			/>

			<RowGrid>
				<ColorInputField
					skeletonMode={skeletonMode}
					control={control}
					modes={['solid']}
					label={t('mainColor')}
					name="main_color"
				/>
				<SelectField
					skeletonMode={skeletonMode}
					control={control}
					label={t('position')}
					items={[
						{ label: t('positions.TopRight'), value: 'top-right' },
						{ label: t('positions.TopLeft'), value: 'top-left' },
						{ label: t('positions.BottomRight'), value: 'bottom-right' },
						{ label: t('positions.BottomLeft'), value: 'bottom-left' },
					]}
					placeholder={t('selectPosition')}
					name="position"
				/>
			</RowGrid>

			<SelectField
				skeletonMode={skeletonMode}
				control={control}
				label={t('themes.title')}
				items={[
					{ label: t('themes.dark'), value: WidgetTheme.Dark },
					{ label: t('themes.light'), value: WidgetTheme.Light },
					{ label: t('themes.both'), value: WidgetTheme.Both },
				]}
				placeholder={t('themes.placeholder')}
				name="theme"
			/>

			<RowGrid className="grid-cols-6">
				<PopoverSelectField
					enableDelete
					skeletonMode={skeletonMode}
					label={t('googleFont.title')}
					items={fontsNameList.map((v) => ({
						label: v,
						value: v,
					}))}
					control={control}
					name="google_font"
					className="col-span-4"
				/>

				<InputField
					skeletonMode={skeletonMode}
					control={control}
					label={t('fontSize')}
					name="font_size"
					suffix="px"
					className="col-span-2"
				/>
			</RowGrid>

			{/* REMOVED FIELDS */}
			{/* <RowGrid>
				<InputField
					skeletonMode={skeletonMode}
					control={control}
					label={t('windowWidth')}
					name="width"
				/>
				<InputField
					skeletonMode={skeletonMode}
					control={control}
					label={t('windowHeight')}
					name="height"
				/>
			</RowGrid> */}

			<InputListField
				addNewLabel={t('addNewDomain')}
				skeletonMode={skeletonMode}
				label={t('allowedDomains')}
				name={`allowed_domains`}
				control={control}
				values={(allowedDomains?.length ? allowedDomains : ['']).map((value) => ({
					getFieldPath(index) {
						return `allowed_domains.${index}` as const;
					},
					value,
				}))}
				newValue={''}
			/>

			<ImageUploadField
				formKey="avatar"
				assetFormKey="avatar_Asset"
				control={control}
				title={t('avatar.title')}
				description={t('avatar.description')}
				dropzoneSettings={{
					accept: {
						'image/*': ['.svg', '.png', '.jpg', '.jpeg', '.webp'],
					},
				}}
			/>

			<div className="space-y-4">
				<CardToggleField
					skeletonMode={skeletonMode}
					control={control}
					name="hide_powered_by"
					title={t('hidePoweredBy')}
					description={t('hidePoweredByDesc')}
				/>
				<CardToggleField
					skeletonMode={skeletonMode}
					control={control}
					name="initially_open"
					title={t('initiallyOpen')}
					description={t('initiallyOpenDesc')}
				/>
			</div>

			{/* <CardRadioField
				title="Theme"
				description="Select the theme for the dashboard."
				items={[
					{
						label: "White",
						node: (
							<ThemeOption
								key="light"
								colors={{
									outerBorder: "muted",
									hoverColor: "accent",
									backgroundColor: "[#ecedef]",
									innerBackgroundColor: "white",
									innerContentColor: "[#ecedef]",
								}}
							/>
						),
						value: "white",
					},
					{
						label: "Black",
						node: (
							<ThemeOption
								key="light"
								colors={{
									outerBorder: "muted",
									hoverColor: "accent-foreground",
									backgroundColor: "slate-950",
									innerBackgroundColor: "slate-800",
									innerContentColor: "slate-400",
								}}
							/>
						),
						value: "black",
					},
				]}
			/> */}
		</>
	);
}
