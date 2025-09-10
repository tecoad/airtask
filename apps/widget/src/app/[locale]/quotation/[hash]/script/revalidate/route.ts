import { ENV } from '@/core/config/env';
import { revalidateTag } from 'next/cache';
import { notFound } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { quotationScriptTag } from './helpers';

type Params = { params: { hash: string } };

const revalidate = (hash: string) => {
	revalidateTag(quotationScriptTag(hash));
	return NextResponse.json({ revalidated: true, now: Date.now() });
};

export async function GET(_request: NextRequest, { params }: Params) {
	if (ENV.vercelEnv) return notFound();

	return revalidate(params.hash);
}

export async function POST(request: NextRequest, { params }: Params) {
	const authorization =
		request.headers.get('authorization') || request.headers.get('Authorization');

	if (
		!authorization ||
		authorization !== ENV.SECRETS.revalidate_quotation_script_secret
	) {
		return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
	}

	return revalidate(params.hash);
}
