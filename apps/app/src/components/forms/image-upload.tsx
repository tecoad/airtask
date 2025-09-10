import { AssetFragment } from '@/core/shared/gql-api-schema';
import { Control, FieldValues, Path, useFormContext } from 'react-hook-form';
import { Dropzone, DropzoneProps } from '../dropzone';
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '../ui/form';
import { ImagesGrid } from './images-grid';

type Props<D extends FieldValues> = {
	control?: Control<D, any>;
	title: string;
	description?: string;
	className?: string;

	formKey: Path<D>;
	assetFormKey: Path<D>;

	dropzoneSettings?: DropzoneProps['dropzoneSettings'];
};

export const ImageUploadField = <D extends FieldValues>({
	control,
	assetFormKey,
	formKey,
	dropzoneSettings,
	description,
	title,
	className,
}: Props<D>) => {
	const { setValue, watch } = useFormContext();
	const asset = watch(assetFormKey) as AssetFragment | null;

	const setAssetValue = (asset: AssetFragment | null) => {
		setValue(formKey, asset ? asset.id : (asset as any), {
			shouldTouch: true,
			shouldDirty: true,
		});
		setValue(assetFormKey, asset as any);
	};

	return (
		<FormField
			control={control}
			name={formKey}
			render={({ field }) => (
				<FormItem className={`${className} flex flex-col`}>
					<div>
						{title && <FormLabel className="text-base">{title}</FormLabel>}
						{description && <FormDescription>{description}</FormDescription>}
					</div>

					<FormControl>
						<div className="flex flex-col gap-4">
							{asset && (
								<div className="bg-foreground/5 w-full rounded-lg p-5">
									<ImagesGrid
										values={[asset.url]}
										onDelete={() => {
											setAssetValue(null);
										}}
									/>
								</div>
							)}
							<Dropzone
								onUpload={(asset) => {
									setAssetValue(asset);
								}}
								dropzoneSettings={{
									maxFiles: 1,
									accept: {
										'image/svg+xml': ['.svg'],
									},
									...dropzoneSettings,
								}}
							/>
						</div>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
