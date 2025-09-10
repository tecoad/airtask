import { getFlowAgentFromServer } from '@/lib/flow-agent/server-helpers';
import { FlowAgentForm } from './components/form';

type Props = {
	params: { id: string };
};

export default async function Page({ params }: Props) {
	return <FlowAgentForm data={await getFlowAgentFromServer(params.id)} />;
}
