'use client';
import TagManager from 'react-gtm-module-custom-domain';

import { ENV } from '@/core/config/env';
import { useEffect } from 'react';

export const ClientRootSetup = () => {
	useEffect(() => {
		TagManager.initialize({
			gtmId: ENV.GTM.id,
			auth: ENV.GTM.auth,
			preview: ENV.GTM.preview,
			customURL: ENV.GTM.url,
		});
	}, []);

	return <></>;
};
