'use client';
import { CopyButton } from '@/components/copy-button';
import { Input } from '@/components/ui/input';
import { OnBoardingStepName } from '@/core/shared/gql-api-schema';
import { useUser } from '@/lib';

type Props = {
	link: string;
};

export const WidgetLinkInteractions = ({ link }: Props) => {
	const { registerOnboardingStepForAccount } = useUser();
	const registerStep = () =>
		registerOnboardingStepForAccount(OnBoardingStepName.FirstQuotationCopyLink);

	return (
		<>
			<Input
				value={link}
				readOnly
				onCopy={(e) => {
					registerStep();
				}}
			/>
			<div className="absolute bottom-0 right-3 top-0 flex items-center">
				<CopyButton
					useOnlyIcon
					copyContent={link}
					onCopy={() => {
						registerStep();
					}}
					extra={{
						className: 'h-8 w-8 rounded-full',
						variant: 'outline',
						size: 'icon',
					}}
					iconProps={{
						size: 14,
						strokeWidth: 2,
						className: '',
					}}
				/>
			</div>
		</>
	);
};
