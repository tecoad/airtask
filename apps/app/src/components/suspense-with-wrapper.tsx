// Direct children from PageContentWrapper have flex spacing, so this wrapper is used to avoid it.
import { Suspense, SuspenseProps } from 'react';

export const SuspenseWithWrapper = ({ children, ...rest }: SuspenseProps) => {
	return (
		<div>
			<Suspense {...rest}>{children}</Suspense>
		</div>
	);
};
