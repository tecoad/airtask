'use client';

import { CardToggleField } from '@/components/forms/card-toggle';
import { QuotationStatus } from '@/core/shared/gql-api-schema';
import { QuotationFormValues } from '@/lib';
import { Controller, useFormContext } from 'react-hook-form';

export const StatusToggle = () => {
	const { control } = useFormContext<QuotationFormValues>();

	return (
		<Controller
			control={control}
			name="status"
			render={({ field }) => (
				<CardToggleField
					control={control}
					className="bg-foreground/5 border-none"
					name="status"
					title="Instance active"
					description="Disabled instance won't be accessible by your customers"
					skipDisabledProvider
					disabled={false}
					overrideSwitchProps={{
						checked: field.value === QuotationStatus.Published,
						onCheckedChange(checked) {
							field.onChange(
								checked ? QuotationStatus.Published : QuotationStatus.Archived,
							);
						},
					}}
				/>
			)}
		/>
	);
};
