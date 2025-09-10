import { LangChainTracer } from 'langchain/callbacks';
import { Client as LangSmith } from 'langsmith';
import { ENV } from 'src/config/env';

export const setupLangSmithTracer = ({
	projectNameSuffix,
}: {
	projectNameSuffix: string;
}) => {
	const langSmith = new LangSmith({
		apiUrl: ENV.LANGSMITH.api_url!,
		apiKey: ENV.LANGSMITH.api_key!,
	});

	const tracer = new LangChainTracer({
		projectName: ENV.LANGSMITH.project_name(projectNameSuffix),
		client: langSmith,
	});

	return tracer;
};
