'use client';
import { CustomButton } from '@/components/custom-button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useDisclosure } from '@/core/hooks/useDisclosure';
import { AccountApiKeyFragment } from '@/core/shared/gql-api-schema';
import { useDeleteAccountApiKey } from '@/lib/account-api-key/hooks';
import { Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const DeleteApiKey = ({ data }: { data: AccountApiKeyFragment }) => {
	const { exec, isLoading } = useDeleteAccountApiKey();
	const t = useTranslations('integrations.api.keys.delete');

	const { isOpen, onOpen, onClose } = useDisclosure();

	return (
		<Dialog onOpenChange={(v) => (v ? onOpen() : onClose())} open={isOpen}>
			<DialogTrigger asChild>
				<CustomButton className="h-9 w-9 rounded-full" size="icon" loading={isLoading}>
					<Trash size={16} />
				</CustomButton>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{t('title')}</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<p>{t('revokeEffects')}</p>
					<Input value={data.maskedToken} readOnly />
				</div>
				<DialogFooter>
					<CustomButton
						type="submit"
						variant="outline"
						onClick={() => {
							onClose();
						}}
						>
						{t('cancel')}
					</CustomButton>
					<CustomButton
						type="submit"
						variant="destructive"
						onClick={async () => {
							await exec(data.id);
							onClose()
						}}
						loading={isLoading}>
						{t('revoke')}
					</CustomButton>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
