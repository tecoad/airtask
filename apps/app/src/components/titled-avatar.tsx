import { AvatarFallbackProps } from '@radix-ui/react-avatar';
import { AvatarFallback } from './ui/avatar';

export const TitledAvatarFallback = (
	props: Omit<AvatarFallbackProps, 'children'> & { title: string },
) => {
	return (
		<AvatarFallback {...props}>
			{props.title
				.split(' ')
				.map((word) => word[0]?.toUpperCase())
				.join('')}
		</AvatarFallback>
	);
};
