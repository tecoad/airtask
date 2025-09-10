import { BgImages } from '@/components/bg-images';
import { PageWrapper } from '@/components/page-wrapper';
import { SidebarProvider } from '@/components/providers/sidebar-provider';
import Sidebar from '@/components/sidebar/sidebar';
import { cookies } from 'next/headers';
import { ReactNode } from 'react';

type LayoutProps = {
	children: ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
	const sidebarCookie = cookies().get('sidebarVisible')?.value;

	// Convert the cookie value to a boolean
	const isSidebarActive: boolean = sidebarCookie === 'true' || sidebarCookie == null;

	return (
		<SidebarProvider sidebarActive={isSidebarActive}>
			<Sidebar />

			<PageWrapper>{children}</PageWrapper>
			<BgImages />
		</SidebarProvider>
	);
};

export default Layout;
