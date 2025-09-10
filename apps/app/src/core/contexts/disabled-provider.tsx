import { ReactNode, createContext, useContext } from 'react';

const DisabledContext = createContext(false);

export const useDisabled = () => useContext(DisabledContext);

export const DisabledProvider = ({
	children,
	value,
}: {
	value?: boolean;
	children: ReactNode;
}) => {
	return (
		<DisabledContext.Provider value={value ?? false}>{children}</DisabledContext.Provider>
	);
};
