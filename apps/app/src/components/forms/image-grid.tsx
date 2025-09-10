import { useImage } from '@/core/hooks/useImage';
import { X } from 'lucide-react';
import { CustomButton } from '../custom-button';
import { Skeleton } from '../ui/skeleton';

interface Props {
	src: string;
	onError: (() => void) | undefined;
	deleteImage: () => void;
}

export const ImageGrid = ({ deleteImage, src }: Props) => {
	const status = useImage({ src });
	return (
		<div className="relative h-28 w-28 overflow-hidden rounded-lg bg-white shadow-md">
			{status === 'loading' ? (
				<Skeleton className="h-full w-full" />
			) : (
				<>
					<CustomButton
						onClick={deleteImage}
						variant="destructive"
						className="p-9items-center absolute right-[5px] top-[5px] flex h-5 w-5 rounded-full  p-0 ">
						<X size={14} />
					</CustomButton>
					<img alt="uploaded image" src={src} className="object-cover" />
				</>
			)}
		</div>
	);
};
