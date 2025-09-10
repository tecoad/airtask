import { LANGUAGES_CODES } from '@/lib/flow-agent/data';
import { NextRequest, NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai-edge';

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: NextRequest) {
	const { script } = await req.json();

	// Ask OpenAI for a streaming chat completion given the prompt
	const response = await openai.createChatCompletion({
		model: 'gpt-4-1106-preview',
		messages: [
			{
				role: 'system',
				content: `
Please analyze the text provided below and identify the language it is written in. 

TEXT:
${script}

Return only the code from the given list: Do not include any additional information or commentary. 

LIST: 
${LANGUAGES_CODES.map((l) => l.code).join(', ')}
`.trim(),
			},
		],
		temperature: 0,
	});
	const data = await response.json();
	const result = data.choices[0].message;

	return NextResponse.json({ languageCode: result.content });
}
