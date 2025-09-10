'use client';

import { apiClient } from '@/core/services/graphql';
import {
	AccountQuotationWidgetSettingsQuery,
	AccountQuotationWidgetSettingsQueryVariables,
	AccountSettingsQuery,
	AccountSettingsQueryVariables,
	AccountUsageKind,
	AssetFragment,
	OnBoardingStepName,
	UpdateAccountWidgetConfigMutation,
	UpdateAccountWidgetConfigMutationVariables,
	UpdateQuotationWidgetSettingsMutation,
	UpdateQuotationWidgetSettingsMutationVariables,
	WidgetConfigFragment,
	WidgetConfigInput,
} from '@/core/shared/gql-api-schema';
import { useCachedAccountSteps } from '@/lib/account';
import { useUser } from '@/lib/user';
import { WidgetContentProps } from '@airtask/widget-design';
import { sub } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { SubmitHandler, UseFormReturn } from 'react-hook-form';
import * as Yup from 'yup';
import {
	ACCOUNT_QUOTATION_WIDGET_SETTINGS,
	UPDATE_QUOTATION_WIDGET_SETTINGS,
} from '../quotation/api-gql';
import { ACCOUNT_CONFIG, UPDATE_ACCOUNT_WIDGET_CONFIG } from './api-gql';
import { quotationConfigToInput } from './helpers';

export type WidgetSettingsFormValues = WidgetConfigInput & {
	avatar_Asset?: AssetFragment;
	icon_Asset?: AssetFragment;

	use_default_settings?: boolean;
};

export const useSetupWidgetSettingsForm = () => {
	const t = useTranslations('settings');

	const defaultValues = useMemo<WidgetSettingsFormValues>(
		() => ({
			title: null,
			primary_color: null,
			chat_height: null,
			call_to_action_text: null,
			redirect_url: null,
			watermark_text: null,
			hide_powered_by: false,
			hide_tooltip: false,
			position: null,
			distance_from_bottom: null,
			horizontal_distance_from_side: null,
			chat_icon_size: null,
			button_color: null,
			button_font_size: null,
			button_icon_color: null,
			button_size: null,
			button_text: null,
			button_text_color: null,
			allowed_domains: [],
			theme: null,
			distance_from_border: null,
			font_size: null,
			google_font: null,
			width: null,
			height: null,
			initially_open: false,
			main_color: null,
			icon: null,
			avatar: null,
		}),
		[],
	);

	const schema = useMemo(() => {
		return Yup.object({
			main_color: Yup.string()
				.nullable()
				.test('is-valid', t('errors.widgetSettings.main_color_hex'), (v) => {
					// Is not required
					if (!v) return true;

					// Check is a valid hex
					const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(v);

					return isValidHex;
				}),
		});
	}, [t]);

	return { defaultValues, schema };
};

export type WidgetSettingsFormMode =
	| 'account_settings'
	| {
			customModule: AccountUsageKind;
			instanceId: string | number;
	  };

export const useWidgetSettingsForm = (
	methods: UseFormReturn<WidgetSettingsFormValues>,
	mode: WidgetSettingsFormMode = 'account_settings',
	afterSubmit?: () => void,
) => {
	const { accountSelected } = useUser();
	const { ensureAccountStepIsConcluded } = useCachedAccountSteps();
	const [data, setData] = useState<WidgetConfigFragment>({});
	const [isDataLoading, setDataLoading] = useState(true);
	// if mode === account_settings, the 'default settings' thing should just not be considered
	const isDefaultSettingsAOption = mode !== 'account_settings';

	const resetFormFromData = (
		input?: WidgetConfigFragment,
		persistData?: Partial<WidgetSettingsFormValues>,
	) => {
		// if input is null, we are using default settings
		const newValues: WidgetSettingsFormValues = input
			? {
					...quotationConfigToInput(input),
					icon_Asset: input?.icon!,
					avatar_Asset: input?.avatar!,
			  }
			: {
					use_default_settings: true,
			  };

		const prevFormState = methods.formState;

		methods.reset(newValues);

		// for persist data, we need to update values after reset to keep the field state
		if (persistData) {
			for (const field of Object.keys(
				persistData,
			) as (keyof WidgetSettingsFormValues)[]) {
				methods.setValue(field, persistData[field], {
					shouldDirty: prevFormState.dirtyFields[field] as boolean,
					shouldTouch: prevFormState.touchedFields[field] as boolean,
				});
			}
		}
	};

	const updateSettingsData = async (
		fetchMode = mode,
		persistData?: Partial<WidgetSettingsFormValues>,
	) => {
		let data: WidgetConfigFragment;

		try {
			if (!accountSelected?.account) return;

			setDataLoading(true);

			if (fetchMode === 'account_settings') {
				const { data: res } = await apiClient.query<
					AccountSettingsQuery,
					AccountSettingsQueryVariables
				>({
					query: ACCOUNT_CONFIG,
					variables: {
						accountId: accountSelected.account.id,
					},
					fetchPolicy: 'no-cache',
				});

				data = res.accountWidgetSettings!;

				setDataLoading(false);
			} else if ('customModule' in fetchMode) {
				switch (fetchMode.customModule) {
					case AccountUsageKind.Quotation:
						const { data: res } = await apiClient.query<
							AccountQuotationWidgetSettingsQuery,
							AccountQuotationWidgetSettingsQueryVariables
						>({
							query: ACCOUNT_QUOTATION_WIDGET_SETTINGS,
							variables: {
								accountQuotationId: fetchMode.instanceId as string,
							},
						});

						data = res.accountQuotation?.widget_config!;

						// Here we only set data loading as false if data !== null
						// because if it is, we will fetch account settings again, and it will make the loading blink
						if (data) {
							setDataLoading(false);
						}

						break;
				}
			}

			resetFormFromData(data!, persistData);
			setData(data!);
		} catch (e) {
			console.log(e);
			setDataLoading(false);
		}
	};

	useEffect(() => {
		if (!accountSelected) return;

		updateSettingsData();
	}, [accountSelected?.account.id]);

	// Control default settings change
	const useDefaultSettings = methods.watch('use_default_settings');
	useEffect(() => {
		if (!isDefaultSettingsAOption) return;

		if (useDefaultSettings) {
			// Here we will populate the form with account settings valuse
			updateSettingsData(
				'account_settings',
				// Persist default settings field value
				{
					use_default_settings: useDefaultSettings,
				},
			);
		}
	}, [useDefaultSettings, isDefaultSettingsAOption]);

	const onSubmit: SubmitHandler<WidgetSettingsFormValues> = async (values) => {
		let data: WidgetConfigFragment;

		// For cases that defaultSettings is a option, and we are using defaultSettings,
		// input will be null, because that what means we are using default account settings for a module
		const input: WidgetConfigInput | null =
			isDefaultSettingsAOption && useDefaultSettings
				? null
				: {
						title: values.title,
						button_color: values.button_color,
						button_icon_color: values.button_icon_color,
						button_font_size: values.button_font_size,
						button_size: values.button_size ? Number(values.button_size) : null,
						button_text: values.button_text,
						button_text_color: values.button_text_color,
						allowed_domains: values.allowed_domains?.filter(Boolean),
						distance_from_border: values.distance_from_border
							? Number(values.distance_from_border)
							: null,
						font_size: values.font_size ? Number(values.font_size) : null,
						google_font: values.google_font,
						height: values.height,
						hide_powered_by: values.hide_powered_by,
						initially_open: values.initially_open,
						main_color: values.main_color,
						position: values.position,
						width: values.width,
						avatar: values.avatar,
						icon: values.icon,
						theme: values.theme,
				  };

		if (mode === 'account_settings') {
			const res = await apiClient.mutate<
				UpdateAccountWidgetConfigMutation,
				UpdateAccountWidgetConfigMutationVariables
			>({
				mutation: UPDATE_ACCOUNT_WIDGET_CONFIG,
				variables: {
					accountId: accountSelected?.account?.id!,
					input: input!,
				},
			});

			data = res.data?.updateAccountWidgetConfig!;
		} else if ('customModule' in mode) {
			switch (mode.customModule) {
				case AccountUsageKind.Quotation:
					const res = await apiClient.mutate<
						UpdateQuotationWidgetSettingsMutation,
						UpdateQuotationWidgetSettingsMutationVariables
					>({
						mutation: UPDATE_QUOTATION_WIDGET_SETTINGS,
						variables: {
							input: {
								id: mode.instanceId as string,
								widget_config: input,
							},
						},
					});

					data = res.data?.updateQuotation.widget_config!;
					break;
			}
		}

		ensureAccountStepIsConcluded(OnBoardingStepName.SetupWidgetSettings);

		resetFormFromData(data!);
		setData(data!);
		afterSubmit?.();
	};

	return {
		onSubmit,
		isDataLoading,
		data,
		resetFormFromData,
		updateSettingsData,
		isDefaultSettingsAOption,
	};
};

export const useFakeWidget = () => {
	const t = useTranslations('settings.widget.widgetPreview');
	const [messages, setMessages] = useState<WidgetContentProps['messages']>([
		{
			content: t('fakeBotMessage'),
			role: 'bot',
			sent_at: sub(new Date(), {
				minutes: 1,
			}),
		},
	]);
	const [isThinking, setThinking] = useState(false);

	const sendMessage = async (input: string) => {
		setMessages((prev) => [
			{
				content: input,
				role: 'user',
				sent_at: new Date(),
			},
			...prev,
		]);

		setThinking(true);

		await new Promise((res) => setTimeout(res, 2500));

		setMessages((prev) => [
			{
				content: t('fakeUserMessage'),
				role: 'bot',
				sent_at: new Date(),
			},
			...prev,
		]);

		setThinking(false);
	};

	return { messages, sendMessage, isThinking };
};
