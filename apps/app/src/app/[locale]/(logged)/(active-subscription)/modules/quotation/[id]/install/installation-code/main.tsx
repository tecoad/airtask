import { ENV } from '@/core/config/env';
import { loadQuotationMetrics } from '@/lib/quotation/server-hooks';
import { InstallationCodeWithInteraction } from './interactions';

export const InstallationCode = async ({ quotationId }: { quotationId: string }) => {
	const { hash } = await loadQuotationMetrics(quotationId);
	const scriptUrl = ENV.WIDGET.widget_script_by_hash('quotation', hash);

	const htmlEmbedCode = /*html*/ `
<script type="text/javascript">
	(function () { d = document; s = d.createElement('script'); s.src ="${scriptUrl}"; s.async = 1; d.getElementsByTagName('head')[0].appendChild(s); })();
</script>
    `.trim();

	return <InstallationCodeWithInteraction htmlEmbedCode={htmlEmbedCode} />;
};
