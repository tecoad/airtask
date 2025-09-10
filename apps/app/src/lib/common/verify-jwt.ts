import { jwtVerify } from 'jose';
import { MiddlewareVerifyJwt } from './auth-middleware';

export const GetDefaultMiddlewareVerifyJwt = (secret: string): MiddlewareVerifyJwt => {
	return async (token) => {
		await jwtVerify(token, new TextEncoder().encode(secret));
	};
};
