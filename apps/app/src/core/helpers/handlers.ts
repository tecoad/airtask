'use client';

import { makeSignPath } from '@/lib/sign/helpers';
import Router from 'next/router';

export const handleUserUnauthenticated = () => {
	Router.push(makeSignPath(window.location.pathname));
};
