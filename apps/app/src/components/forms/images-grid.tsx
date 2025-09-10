import React from 'react';
import { ImageGrid } from './image-grid';

interface Props {
	values: string[];
	setValues?: React.Dispatch<React.SetStateAction<string[]>>;
	onDelete?(index: number): void;
	removeOnError?: boolean;
	onError?(index: number): void;
}

export const ImagesGrid = ({
	values,
	setValues,
	onDelete,
	removeOnError,
	onError,
}: Props) => {
	return (
		<div className="grid gap-2">
			{values?.map((v, k) => {
				const deleteImage = () => {
					setValues && setValues((prev) => prev.filter((_, key) => key !== k));
					onDelete && onDelete(k);
				};

				return (
					<ImageGrid
						key={k}
						src={v}
						deleteImage={deleteImage}
						onError={
							removeOnError
								? () => {
										deleteImage();
										onError && onError(k);
								  }
								: undefined
						}
					/>
				);
			})}
		</div>
	);
};
