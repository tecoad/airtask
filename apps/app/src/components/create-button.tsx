import { PlusCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CustomButton } from './custom-button';

interface Props {
	onClick: () => void;
}

const CreateButton = ({ onClick }: Props) => {
	const t = useTranslations('ui');

	return (
		<CustomButton
			className="hidden rounded-full md:flex"
			size="sm"
			variant="outline"
			onClick={onClick}>
			<PlusCircle size={18} strokeWidth={2} className="text-foreground mr-2" />
			{t('createNew')}
		</CustomButton>
	);
};

export default CreateButton;
