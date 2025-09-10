import { apiClient } from '@/core';
import { useDisabled } from '@/core/contexts/disabled-provider';
import {
	AssetFragment,
	UploadFileMutation,
	UploadFileMutationVariables,
} from '@/core/shared/gql-api-schema';
import { UPLOAD_FILE } from '@/lib/quotation/api-gql';
import { Loader2, UploadCloud } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { DropzoneOptions, useDropzone } from 'react-dropzone';
import { CustomButton } from './custom-button';
import { Card } from './ui/card';

export type DropzoneProps = {
	onCustomOnDrop?: DropzoneOptions['onDrop'];
	/**
	 * If onUpload is provided, it will be upload to the api
	 */
	onUpload?: (asset: AssetFragment) => void | Promise<void>;
	dropzoneSettings?: Omit<DropzoneOptions, 'onDrop'>;
};

export const Dropzone = ({
	onUpload,
	dropzoneSettings = {},
	onCustomOnDrop,
}: DropzoneProps) => {
	const t = useTranslations('ui.dropzone');
	const [isLoading, setLoading] = useState(false);
	const disabled = useDisabled();

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		...dropzoneSettings,
		onDrop: async (...params) => {
			const [files] = params;
			onCustomOnDrop?.(...params);

			if (onUpload) {
				setLoading(true);
				try {
					for (const file of files) {
						const res = await apiClient.mutate<
							UploadFileMutation,
							UploadFileMutationVariables
						>({
							mutation: UPLOAD_FILE,
							variables: {
								file,
							},
						});
						onUpload(res.data?.uploadFile?.[0]!);
					}
				} finally {
					setLoading(false);
				}
			}
		},
		disabled,
	});

	const getFileDescription = () => {
		if (!dropzoneSettings?.accept) {
			return t('anyFileType');
		}

		let fileTypes = [];
		for (let key in dropzoneSettings.accept) {
			fileTypes.push(...dropzoneSettings.accept[key].map((ext) => ext.slice(1)));
		}
		return t('fileType', {
			types: fileTypes.join(', '),
		});
	};

	return (
		<Card
			{...getRootProps()}
			className={`flex flex-col items-center gap-3 p-6 ${disabled ? 'opacity-40' : ''}`}>
			<>
				<div className="bg-foreground/5 highlight-foreground/10 flex h-12 w-12 items-center justify-center  rounded-full">
					{isLoading ? (
						<Loader2 size={24} strokeWidth={1.5} className="animate-spin" />
					) : (
						<UploadCloud size={24} strokeWidth={1.5} />
					)}
				</div>
				<div className="flex flex-col items-center gap-0">
					<div className="flex flex-col items-center  md:flex-row ">
						<CustomButton variant="link" className="h-6 gap-2 p-2">
							{t('clickToUpload')}
						</CustomButton>
						<div className="text-muted-foreground text-sm">
							<input {...getInputProps()} />
							{isDragActive ? t('orDrop') : t('orDrag')}
						</div>
					</div>
					<div className="text-muted-foreground text-sm">{getFileDescription()}</div>
				</div>
			</>
		</Card>
	);
};
