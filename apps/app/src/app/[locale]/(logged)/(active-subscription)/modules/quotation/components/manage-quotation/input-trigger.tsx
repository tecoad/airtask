import { useTranslations } from 'next-intl';

import * as editable from '@zag-js/editable';
import { normalizeProps, useMachine } from '@zag-js/react';
import { Check, Edit, Eye, X } from 'lucide-react';
import { useEffect, useId } from 'react';
import { CustomButton } from '../../../../../../../../components/custom-button';

interface Props {
	data?: string;
	onDataChange?: (data: string) => void;
	type?: 'condition' | 'question';
	numChilds?: number;
	onChildsToggle?: () => void;
	errorMessage?: string;
	isEditInOverlay?: boolean;
	skeletonMode?: boolean;
	placeholder?: string;
}

export const InputTrigger = ({
	data,
	type,
	numChilds,
	errorMessage,
	onDataChange,
	isEditInOverlay,
	onChildsToggle,
	skeletonMode,
	placeholder,
}: Props) => {
	const id = useId();
	const t = useTranslations('quotation.edit');

	const [state, send] = useMachine(
		editable.machine({
			id,
			autoResize: true,
			placeholder: placeholder || t('questionPlaceholder'),
			submitMode: 'both',
			onSubmit(details) {
				onDataChange?.(details.value);
			},
		}),
	);
	const api = editable.connect(state, send, normalizeProps);

	// Define a default border color as transparent
	let classes = 'border-transparent bg-foreground/5';

	if (api.isEditing) {
		classes = 'border-foreground/80';
	} else if (errorMessage) {
		classes = 'border-destructive bg-destructive/10 border-dotted';
	} else if (data && !skeletonMode) {
		classes = 'border-foreground/30';
	}

	// when data prop changes, set value to api
	useEffect(() => {
		api.setValue(data || '');
	}, [data]);

	return (
		<div {...api.rootProps} className="w-full">
			<div
				{...api.areaProps}
				className={`text-foreground relative w-full cursor-pointer rounded-md border-2 p-3 ${classes} ${
					skeletonMode ? ' bg-background/50' : ''
				}`}>
				<div className="absolute -top-6 right-0 flex  h-full items-center gap-2   pl-6 pr-3 ">
					{api.isEditing ? (
						<>
							<CustomButton
								size="icon"
								variant="default"
								className="h-9 w-9 rounded-full"
								{...api.submitTriggerProps}>
								<Check strokeWidth={2.5} size={20} />
							</CustomButton>

							<CustomButton
								size="icon"
								variant="secondary"
								className="h-9 w-9 rounded-full"
								{...api.cancelTriggerProps}>
								<X strokeWidth={2.5} size={20} />
							</CustomButton>
						</>
					) : (
						<>
							{/* is edit in overlay, shouldn't be able to reopen the overlay for the same question, and the item showing 
								the num of childs must only be visible at the first level of the question
							*/}
							{!isEditInOverlay && (
								<>
									{!!numChilds && (
										<div className="text-bold  bg-background highlight-white/10 flex h-6 w-6 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-blue-500/20 to-blue-500 leading-none text-white">
											{numChilds}
										</div>
									)}

									{type == 'question' &&
										(skeletonMode ? (
											<div className="bg-foreground/20 h-9 w-9 rounded-full" />
										) : (
											<CustomButton
												size="icon"
												variant="outline"
												className={`h-9 w-9 rounded-full`}
												onClick={onChildsToggle}>
												<Eye size={20} />
											</CustomButton>
										))}
								</>
							)}
							{/* {errorMessage && (
								<>
									<TooltipProvider>
										<Tooltip defaultOpen>
											<TooltipTrigger>
												<CustomButton
													size="icon"
													variant="destructive"
													className="h-9 w-9 cursor-pointer rounded-full">
													<AlertCircle size={20} />
												</CustomButton>
											</TooltipTrigger>
											<TooltipContent side="left" className="border-none">
												{errorMessage}
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</>
							)} */}

							{skeletonMode ? (
								<div className="bg-foreground/20 h-9 w-9 rounded-full" />
							) : (
								<CustomButton
									size="icon"
									className={`h-9 w-9 rounded-full`}
									{...api.editTriggerProps}>
									<Edit size={14} />
								</CustomButton>
							)}
						</>
					)}
				</div>
				<span
					className={`${skeletonMode ? 'is-skeleton w-36' : ''}`}
					{...api.previewProps}
				/>
				<input {...api.inputProps} />
			</div>
		</div>
	);
};
