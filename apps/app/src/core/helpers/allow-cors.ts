import type { NextApiRequest, NextApiResponse } from 'next';

export const allowCors =
	(fn: (req: NextApiRequest, res: NextApiResponse) => Promise<any>) =>
	async (req: NextApiRequest, res: NextApiResponse) => {
		res.setHeader('Access-Control-Allow-Credentials', 'true');
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
		res.setHeader(
			'Access-Control-Allow-Headers',
			'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
		);

		// Handle CORS pre-flight
		if (req.method === 'OPTIONS') {
			res.status(200).end();
			return;
		}

		return await fn(req, res);
	};
