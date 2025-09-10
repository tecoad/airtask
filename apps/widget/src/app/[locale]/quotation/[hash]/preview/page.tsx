'use client';
import { ENV } from '@/core/config/env';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';

type Props = {
	params: { hash: string };
};

export default function Page({ params }: Props) {
	const { hash } = params;
	const url = useSearchParams().get('url') || 'www.airtask.ai';

	let iframeSrc;

	if (url.startsWith('http://') || url.startsWith('https://')) {
		iframeSrc = url;
	} else {
		iframeSrc = `https://${url}`;
	}

	const scriptUrl = ENV.WIDGET.widget_script_by_hash('quotation', hash);

	return (
		<>
			<Script id="script">
				{`(function () { d = document; s = d.createElement('script'); s.src ='${scriptUrl}'; s.async = 1; d.getElementsByTagName('head')[0].appendChild(s); })();`}
			</Script>

			<iframe
				src={iframeSrc}
				allowFullScreen
				style={{
					width: '100%',
					height: '100%',
					border: 'none',
					margin: 0,
					padding: 0,
					position: 'absolute',
					top: 0,
					left: 0,
					zIndex: -2,
				}}></iframe>
		</>
	);
}
