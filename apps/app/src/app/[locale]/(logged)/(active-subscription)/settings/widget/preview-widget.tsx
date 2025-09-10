'use client';

import { CustomButton } from '@/components/custom-button';
import { useBoolean } from '@/core/hooks/useBoolean';
import { WidgetTheme } from '@/core/shared/gql-api-schema';
import { WidgetSettingsFormValues, useFakeWidget } from '@/lib/settings';
import { Widget } from '@airtask/widget-design';
import { Eye } from 'lucide-react';
import { useLocale, useMessages, useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

export const PreviewWidget = () => {
	const t = useTranslations('settings.widget');
	const { watch } = useFormContext<WidgetSettingsFormValues>();
	const settings = watch();

	const i18n = {
		locale: useLocale(),
		messages: useMessages(),
	};

	const { isThinking, messages, sendMessage } = useFakeWidget();

	const [show, { toggle }] = useBoolean();

	return (
		<div>
			<div className="absolute left-0 top-0 h-[1px] w-full ">
				{show && (
					<div className="absolute bottom-0 h-[70vh] w-full overflow-hidden rounded-lg border shadow-xl lg:max-w-[500px]">
						<Widget
							i18n={i18n}
							availableThemes={settings.theme!}
							activeTheme={settings.theme as WidgetTheme.Dark | WidgetTheme.Light}
							content={{
								isThinking,
								messages,
								avatarSrc: settings.avatar_Asset?.url,
								chatIconSrc: settings.icon_Asset?.url,
							}}
							hidePoweredBy={settings.hide_powered_by!}
							position={settings.position!}
							header={{
								title: settings.title! || t('defaultTitle'),
							}}
							mainColor={settings.main_color!}
							googleFontName={settings.google_font!}
							fontSize={settings.font_size!}
							height={settings.height!}
							input={{
								sendMessage,
							}}
						/>
					</div>
				)}
			</div>

			<CustomButton variant="secondary" type="button" onClick={toggle}>
				<Eye size={16} strokeWidth={1.5} className="mr-2" />
				{t('previewWidget')}
			</CustomButton>
		</div>
	);
};
