import { Body, Controller, Post } from '@nestjs/common';
import { IsNotEmpty, IsNotEmptyObject, IsObject, IsString } from 'class-validator';
import { OpenAI } from 'langchain/llms/openai';
import { setupLangSmithTracer } from 'src/shared/utils/setup-langsmith-tracer';
import { aiToolPrompt } from '../prompts';

export class PersonaGeneratorDTO {
	@IsObject()
	@IsNotEmptyObject()
	replaces: Record<string, string | number>;

	@IsNotEmpty()
	@IsString()
	prompt_name: string;
}

@Controller('ai-tools')
export class AiToolsController {
	private llm = new OpenAI({
		temperature: 0,
		maxTokens: 1600,
		callbacks: [
			setupLangSmithTracer({
				projectNameSuffix: 'ai-tools',
			}),
		],
	});

	@Post('raw')
	async generateRaw(@Body() data: PersonaGeneratorDTO) {
		const result = await this.llm.call(await aiToolPrompt(data));
		return { result };
	}

	@Post()
	async generate(@Body() data: PersonaGeneratorDTO) {
		const result = await this.llm.call(await aiToolPrompt(data));
		return { result: JSON.parse(result) };
	}
}
