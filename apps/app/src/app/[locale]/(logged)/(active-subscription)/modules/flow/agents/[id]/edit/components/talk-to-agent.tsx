import { CustomButton } from '@/components/custom-button';
import { InputField } from '@/components/forms/input';
import { PhoneNumberField } from '@/components/forms/phone-number-field';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { yupResolver } from '@hookform/resolvers/yup';
import { Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import * as Yup from 'yup';

import { Form } from '@/components/ui/form';
import { formatNumber, isPhoneValid } from '@/core';
import { useDisclosure } from '@/core/hooks/useDisclosure';
import { useDebugTalkToAgent } from '@/lib/flow-agent/hooks';
import { PhoneNumberFormat } from 'google-libphonenumber';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';

export const TalkToAgent = () => {
	const t = useTranslations('flow.agents.talkToAgent');
	const { talk, isLoading } = useDebugTalkToAgent();
	const params = useParams();

	const methods = useForm<{
		prospectName: string;
		phoneNumber: string;
	}>({
		resolver: yupResolver(
			Yup.object({
				prospectName: Yup.string().required(t('required')),
				phoneNumber: Yup.string()
					.required(t('required'))
					.test('is-valid', t('invalidPhoneNumber'), (v) => isPhoneValid(v)),
			}) as any,
		),
	});
	const {
		formState: { isDirty },
	} = methods;

	const { isOpen, onOpen, onClose } = useDisclosure();

	return (
		<Dialog open={isOpen} onOpenChange={(v) => (v ? onOpen() : onClose())}>
			<DialogTrigger asChild>
				<CustomButton variant="default" size="lg" className="w-full px-2">
					<Phone size={16} className="mr-3" />
					{t('action')}
				</CustomButton>
			</DialogTrigger>
			<DialogContent>
				<Form {...methods}>
					<form className="contents">
						<DialogHeader>
							<DialogTitle>{t('testAgent')}</DialogTitle>
							<DialogDescription></DialogDescription>
						</DialogHeader>
						<InputField
							control={methods.control}
							name="prospectName"
							label={t('prospectName')}
						/>
						<PhoneNumberField
							control={methods.control}
							name="phoneNumber"
							label={t('phoneNumber')}
						/>
						<DialogFooter>
							<CustomButton
								loading={isLoading}
								disabled={!isDirty}
								onClick={async () => {
									const valid = await methods.trigger();

									if (!valid) return;

									const values = methods.getValues();

									await talk({
										agentId: params.id as string,
										...values,
										phoneNumber: formatNumber(values.phoneNumber, PhoneNumberFormat.E164),
									});
									onClose();
								}}>
								{t('talk')}
							</CustomButton>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
