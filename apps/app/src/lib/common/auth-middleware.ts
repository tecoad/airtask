import { ENV } from '@/core/config/env';
import { NextRequest } from 'next/server';
import { makeSignPath } from '../sign/helpers';
import { GetDefaultMiddlewareVerifyJwt } from './verify-jwt';

/**
 * @throws Error if not authenticated
 */
export type MiddlewareVerifyJwt = (token: string) => Promise<void>;
export type MiddlewareExtractToken = (req: NextRequest) => string | undefined;

/**
 * When te route can be identified by path and exact
 */
type MiddlewareRouteStringExtract = {
	path: string;
	exact: boolean;
};
/**
 * When params above aren't enough to identify the route, use a function
 * to extract the route
 */
type MiddlewareRouteFunctionExtract = {
	/**
	 * @returns true if the route is the one being requested
	 */
	extractRoute: (req: NextRequest) => boolean;
};

type MiddlewareRoute = {
	verifyAuth: MiddlewareVerifyJwt;
	extractTokenFromRequest: MiddlewareExtractToken;
} & (
	| {
			protected: false;
			/**
			 * Path to redirect when user is already logged
			 */
			redirectIfLogged?: string;
	  }
	| {
			protected: true;
			/**
			 * Path to redirect when user is not logged
			 */
			redirectTo: string | ((req: NextRequest) => string);
	  }
) &
	(MiddlewareRouteStringExtract | MiddlewareRouteFunctionExtract);
type MiddlewareRouteHandlers = Pick<
	MiddlewareRoute & { protected: true },
	'extractTokenFromRequest' | 'verifyAuth' | 'redirectTo'
>;

const userHandlers: MiddlewareRouteHandlers = {
	extractTokenFromRequest: (req) => {
		return req.cookies.get('session')?.value;
	},
	verifyAuth: GetDefaultMiddlewareVerifyJwt(ENV.USERS.jwt_secret!),
	redirectTo: (req) => {
		return makeSignPath(req.nextUrl.pathname);
	},
};

export const middlewareRoutes: MiddlewareRoute[] = [
	{
		path: '/dashboard',
		exact: true,
		protected: true,
		...userHandlers,
	},
	{
		path: '/settings',
		exact: true,
		protected: true,
		...userHandlers,
	},

	{
		path: '/billing',
		exact: true,
		protected: true,
		...userHandlers,
	},
	{
		path: '/plans',
		exact: true,
		protected: true,
		...userHandlers,
	},
	{
		path: '/modules',
		exact: false,
		protected: true,
		...userHandlers,
	},
	{
		path: '/admin',
		exact: false,
		protected: true,
		...userHandlers,
	},
	{
		path: '/affiliate',
		exact: false,
		protected: true,
		...userHandlers,
	},
	{
		path: '/success',
		exact: false,
		protected: true,
		...userHandlers,
	},
	{
		extractRoute(req) {
			return ['/auth/login', '/auth/register'].includes(req.nextUrl.pathname);
		},
		exact: true,
		protected: false,
		redirectIfLogged: '/dashboard',
		...userHandlers,
	},
];
