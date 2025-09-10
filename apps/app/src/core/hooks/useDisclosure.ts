import { useState } from 'react';

export const useDisclosure = (initial = false) => {
	const [isOpen, setOpen] = useState(initial);

	const onOpen = () => setOpen(true);
	const onClose = () => setOpen(false);
	const onToggle = () => setOpen(!isOpen);

	return {
		isOpen,
		onOpen,
		onClose,
		onToggle,
	};
};
