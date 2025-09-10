import { CustomButton } from '@/components/custom-button';
import { InputField } from '@/components/forms/input';
import { PopoverSelectField } from '@/components/forms/popover-select';
import { SelectField } from '@/components/forms/select';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { CONSTANTS } from '@/core/config/constants';
import { currencyToSymbol } from '@/core/helpers/currency-to-symbol';
import { FlowFragment, FlowStatus, FlowType } from '@/core/shared/gql-api-schema';
import { useUser } from '@/lib';
import { useListFlowAgents } from '@/lib/flow-agent/hooks';
import { useListFlowContactSegments } from '@/lib/flow-contact-segment/hooks';
import { FlowFormValues, useFlowForm, useSetupFlowForm } from '@/lib/flow/hooks';
import { yupResolver } from '@hookform/resolvers/yup';
import { PlusCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

type Props = {
	isOpen: boolean;
	onClose: () => void;
	item?: FlowFragment;
	onUpdate: (updatedItem: FlowFragment) => void;
	onCreate: (createdItem: FlowFragment) => void;
};

export const EditOrCreateNewFlow = ({
	isOpen,
	onClose,
	onCreate,
	onUpdate,
	item,
}: Props) => {
	const t = useTranslations('flow.campaigns.editOrCreate');
	const { accountSelected, isUserLoading } = useUser();
	const { defaultValues, schema } = useSetupFlowForm();
	const { data: agents, isLoading: isAgentsLoading } = useListFlowAgents();
	const { data: contactSegments, isLoading: isContactSegmentsLoading } =
		useListFlowContactSegments();

	const methods = useForm<FlowFormValues>({
		defaultValues,
		resolver: yupResolver(schema) as any,
	});
	const {
		formState: { isSubmitting, isDirty },
	} = methods;
	const { onSubmit } = useFlowForm({ methods, onCreate, onUpdate, item, isOpen });
	const createNewRedirectBack = `${CONSTANTS.queryParams.createNewDefaultOpen}=true&${
		CONSTANTS.queryParams.redirect
	}=${`/modules/flow?${CONSTANTS.queryParams.createNewDefaultOpen}=true`}`;
	const isEdit = !!item;

	const type = methods.watch('type');

	return (
		<>
			<Dialog
				open={isOpen}
				onOpenChange={(v) => {
					!v && onClose();
				}}>
				<DialogContent
					onInteractOutside={(e) => e.stopPropagation()}
					onCloseAutoFocus={(e) => {
						e.preventDefault();
					}}>
					<Form {...methods}>
						<form className="contents" onSubmit={methods.handleSubmit(onSubmit)}>
							<DialogHeader>
								<DialogTitle className="text-foreground">
									{item
										? t('instanceName', {
												name: item.name,
										  })
										: t('createNewInstance')}
								</DialogTitle>
							</DialogHeader>

							<div className="flex flex-col gap-3">
								<InputField control={methods.control} name="name" label={t('name')} />

								<div className="flex items-center justify-between gap-3">
									{!isEdit && (
										<SelectField
											control={methods.control}
											label={t('type')}
											name="type"
											placeholder={t('selectTypePlaceholder')}
											className="w-full"
											items={[
												{
													label: t('inbound'),
													value: FlowType.Inbound,
												},
												{
													label: t('outbound'),
													value: FlowType.Outbound,
												},
											]}
										/>
									)}

									{isEdit && (
										<SelectField
											control={methods.control}
											label={t('status')}
											name="status"
											className="w-full"
											items={[
												{
													label: t('active'),
													value: FlowStatus.Active,
												},
												{
													label: t('paused'),
													value: FlowStatus.Paused,
												},
											]}
										/>
									)}
								</div>

								<div className="flex gap-3">
									<PopoverSelectField
										skeletonMode={isAgentsLoading}
										label={t('selectAgent')}
										className="w-full"
										items={(agents || []).map((v) => ({
											label: v.title,
											value: v.id,
										}))}
										control={methods.control}
										placeholder={t('selectAgentPlaceholder')}
										name="agentId"
										replaceInput={
											!isAgentsLoading && !agents?.length ? (
												<Link href={`/modules/flow/agents?${createNewRedirectBack}`}>
													<CustomButton className="h-8">
														<PlusCircle size={16} className="mr-2" />
														{t('createNewAgent')}
													</CustomButton>
												</Link>
											) : undefined
										}
									/>

									{type === FlowType.Outbound && (
										<PopoverSelectField
											skeletonMode={isContactSegmentsLoading}
											label={t('selectSegment')}
											className="w-full"
											items={(contactSegments || []).map((v) => ({
												label: v.label,
												value: v.id,
											}))}
											placeholder={t('selectSegmentPlaceholder')}
											control={methods.control}
											name="segmentId"
											replaceInput={
												!isContactSegmentsLoading && !contactSegments?.length ? (
													<Link href={`/modules/flow/segments?${createNewRedirectBack}`}>
														<CustomButton className="h-8">
															<PlusCircle size={16} className="mr-2" />
															{t('createNewSegment')}
														</CustomButton>
													</Link>
												) : undefined
											}
										/>
									)}
								</div>

								<InputField
									control={methods.control}
									name="dailyBudget"
									type="number"
									prefix={
										!isUserLoading
											? currencyToSymbol(accountSelected?.account.currency!)
											: undefined
									}
									label={t('dailyBudget')}
								/>
							</div>
							<DialogFooter>
								<CustomButton variant="ghost" onClick={onClose}>
									{t('close')}
								</CustomButton>
								<CustomButton disabled={!isDirty} loading={isSubmitting} type="submit">
									{t('saveChanges')}
								</CustomButton>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</>
	);
};
