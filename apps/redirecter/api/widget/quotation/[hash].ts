import type { VercelRequest, VercelResponse } from '@vercel/node';
import { allowCors } from '../../_lib/allowCors';

const handler = async (req: VercelRequest, res: VercelResponse) => {
	const { hash } = req.query;

	return res.redirect(resolveWidgetUrl(hash as string));
};

function resolveWidgetUrl(hash: string) {
	return process.env.WIDGET_URL?.replace('{hash}', hash);
}

export default allowCors(handler);
