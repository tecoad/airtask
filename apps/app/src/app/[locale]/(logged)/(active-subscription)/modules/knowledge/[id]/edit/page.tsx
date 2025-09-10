import { getKnowledgeBase } from '@/lib/knowledge/server';
import { Knowledge } from './knowledge';

type Props = {
	params: {
		id: string;
	};
};

const Page = async (props: Props) => {
	const data = await getKnowledgeBase(props.params.id);
	return <Knowledge data={data} />;
};

export default Page;
