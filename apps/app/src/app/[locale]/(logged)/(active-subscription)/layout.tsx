'use client';

import { useAccountRedirects } from '@/lib/user/hooks';
import { ReactNode } from 'react';

const Layout = ({ children }: { children: ReactNode }) => {
	useAccountRedirects(['active_subscription']);

	return children;
};

export default Layout;
