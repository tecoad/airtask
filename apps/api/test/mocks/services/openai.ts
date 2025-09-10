import * as openAiModels from 'langchain/chat_models/openai';
import { BaseLangChainParams } from 'langchain/dist/base_language';

export const mockOpenAiChatWithStream = (tokens: string[], tokensInterval = 20) => {
	const message = tokens.join(' ');

	jest.spyOn(openAiModels, 'ChatOpenAI').mockImplementation(
		jest.fn().mockImplementation((input: BaseLangChainParams) => {
			const newTokenCallback = input.callbacks?.[0].handleLLMNewToken;

			return {
				call: jest.fn().mockImplementation(async () => {
					if (newTokenCallback) {
						let lastCalledTokenIndex = 0;

						// Await typing to simulate a real conversation
						await new Promise((res) => {
							const interval = setInterval(() => {
								if (lastCalledTokenIndex >= tokens.length) {
									res(true);
									clearInterval(interval);

									return;
								}

								newTokenCallback(tokens[lastCalledTokenIndex]);

								lastCalledTokenIndex++;
							}, tokensInterval);
						});
					}

					await new Promise((resolve) => setTimeout(resolve, 3000));

					return {
						text: message,
					};
				}),
			};
		}),
	);

	return message;
};
