'use client';
import { setCookie } from 'cookies-next';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface SidebarContextContent {
	sidebarVisible: boolean;
	setSidebarVisible: (value: boolean) => void;
}
const SidebarContext = createContext<SidebarContextContent>({} as SidebarContextContent);

interface SidebarProviderProps {
	children: ReactNode;
	sidebarActive: boolean;
}

export const SidebarProvider = ({ children, sidebarActive }: SidebarProviderProps) => {
	const [sidebarVisible, setSidebarVisible] = useState(sidebarActive);

	useEffect(() => {
		setCookie('sidebarVisible', sidebarVisible);
	}, [sidebarVisible, setCookie]);

	return (
		<SidebarContext.Provider
			value={{
				sidebarVisible,
				setSidebarVisible,
			}}>
			{children}
		</SidebarContext.Provider>
	);
};

export const useSidebar = () => useContext(SidebarContext);
