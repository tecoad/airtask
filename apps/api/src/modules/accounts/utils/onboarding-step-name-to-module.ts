import { AccountUsageKind, OnBoardingStepName } from 'src/graphql';

export const onBoardingStepNameToModule: Record<OnBoardingStepName, AccountUsageKind> = {
	[OnBoardingStepName.finish_setup_account]: AccountUsageKind.quotation,
	[OnBoardingStepName.create_first_quotation]: AccountUsageKind.quotation,
	[OnBoardingStepName.first_quotation_copy_link]: AccountUsageKind.quotation,
	[OnBoardingStepName.receive_first_quotation_request]: AccountUsageKind.quotation,
	[OnBoardingStepName.setup_widget_settings]: AccountUsageKind.quotation,
};
