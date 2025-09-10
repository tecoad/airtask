import { Plus } from 'lucide-react';
import { CustomButton } from '../../../../../../../../components/custom-button';
import { ButtonProps } from '../../../../../../../../components/ui/button';

export const CreateNewQuestion = (props: ButtonProps) => {
	return (
		<div className="flex flex-col items-center ">
			<CustomButton aria-label="Add" className="rounded-full" size="icon" {...props}>
				<Plus />
			</CustomButton>
		</div>
	);
};
