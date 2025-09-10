'use client';

import { CopyButton } from '@/components/copy-button';
import { OnBoardingStepName } from '@/core/shared/gql-api-schema';
import { useUser } from '@/lib';

type Props = {
	htmlEmbedCode: string;
};

export const InstallationCodeWithInteraction = ({ htmlEmbedCode }: Props) => {
	const { registerOnboardingStepForAccount } = useUser();

	const registerStep = () =>
		registerOnboardingStepForAccount(OnBoardingStepName.FirstQuotationCopyLink);

	return (
		<>
			<code
				className="whitespace-pre-wrap break-words font-mono text-sm"
				onCopy={registerStep}>
				{htmlEmbedCode}
			</code>
			<CopyButton
				useOnlyIcon
				onCopy={registerStep}
				copyContent={htmlEmbedCode}
				extra={{
					className: 'absolute right-3 top-3 z-10 h-8 w-8 rounded-full',
					variant: 'outline',
					size: 'icon',
				}}
				iconProps={{
					size: 14,
					strokeWidth: 2,
					className: '',
				}}
			/>
		</>
	);
};
