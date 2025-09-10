import { SectionTitle } from '@/components/section-title';
import { fetchGoggleFontFamilyList } from '@/lib/settings/helpers';
import { useTranslations } from 'next-intl';
import { Form } from './form';

export type Props = {
	params: { id: string };
};

const Content = ({ fontsNameList }: Props & { fontsNameList: string[] }) => {
	const t = useTranslations('quotation.widget');

	return (
		<>
			<SectionTitle title={t('title')} subtitle={t('subtitle')} />
			<Form fontsNameList={fontsNameList} />
		</>
	);
};

export default async function Page(props: Props) {
	const fontsNameList = await fetchGoggleFontFamilyList();

	return <Content fontsNameList={fontsNameList} {...props} />;
}
