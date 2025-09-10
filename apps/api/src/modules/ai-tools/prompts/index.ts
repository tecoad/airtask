import { pull } from 'langchain/hub';
import { PromptTemplate } from 'langchain/prompts';
import { ENV } from 'src/config/env';
import { PersonaGeneratorDTO } from '../controllers/ai-tools.controller';

export const aiToolPrompt = async (data: PersonaGeneratorDTO): Promise<string> => {
	const prompt = (await pull(ENV.LANGSMITH.repo_name(data.prompt_name, true), {
		apiKey: ENV.LANGSMITH.api_key,
	})) as PromptTemplate;

	let template = prompt.lc_kwargs.template;

	for (const [key, value] of Object.entries(data.replaces)) {
		template = template.replaceAll(`{${key}}`, value);
	}

	return template;
};
