import { ENV } from '@/config/env';
import { PrismaService } from '@airtask/api/dist/modules/common/services/prisma.service';
import { TwilioService } from '@airtask/api/dist/modules/common/services/twilio.service';
import { flowInteractionCacheKey } from '@airtask/api/dist/modules/flows/services/constants';
import { FlowInteractionCache } from '@airtask/api/dist/modules/flows/services/flow-interaction.service';
import { FlowInteractionHistory } from '@airtask/api/dist/shared/types/db';
import { setupLangSmithTracer } from '@airtask/api/dist/shared/utils/setup-langsmith-tracer';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { OpenAIAgentTokenBufferMemory } from 'langchain/agents/toolkits';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ChatMessageHistory } from 'langchain/memory';
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from 'langchain/schema';
import { DynamicStructuredTool, DynamicTool } from 'langchain/tools';
import * as z from 'zod';
import { callInMemoryEventsHandler } from '../gateways/flow-call.gateway';
import { CalendarIntegrationsService } from './calendar-integrations.service';
import { CallTextToSpeechHandlerService } from './text-to-speech-handler.service';

@Injectable()
export class CallPromptUserMessagesHandlerService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly textToSpeechHandler: CallTextToSpeechHandlerService,
    private readonly twilio: TwilioService,
    private readonly prismaService: PrismaService,
    private readonly calendarIntegrationService: CalendarIntegrationsService,
  ) {}

  get eventsHandler() {
    return callInMemoryEventsHandler;
  }

  private sentenceSplitters = [
    '.',
    ',',
    '?',
    '!',
    ';',
    ':',
    '—',
    '-',
    '(',
    ')',
    '[',
    ']',
    '}',
    ' ',
  ];

  main(params: {
    onTextToken?: (token: string) => void | Promise<void>;
    onAudioStream?: (base64: string) => void | Promise<void>;
    onFinalAudio?: (base64: string) => void | Promise<void>;
    isPcmInputFormat?: boolean;
    connectionId: string;
    getCallSid?: () => string;
  }) {
    const {
      onAudioStream,
      onTextToken,
      onFinalAudio,
      isPcmInputFormat,
      connectionId,
    } = params;

    let flowInteractionData: FlowInteractionCache;
    let interactionId: string;

    const { setupTextToSpeech } = this.textToSpeechHandler.main({
      onAudioStream,
      onFinalAudio,
      isPcmInputFormat,
      connectionId,
      getCacheData() {
        return flowInteractionData!;
      },
    });

    const history: {
      talkId: string;
      message: BaseMessage;
    }[] = [];

    /**
     * Push a message to the history and saves to the cache data
     * and at the database, synchronously without costing any time
     */
    const pushToHistory = (
      input:
        | {
            talkId: string;
            message: HumanMessage;
          }
        | {
            token: string;
            talkId: string;
          },
    ) => {
      // Is a full human message, just push
      if ('message' in input) {
        history.push({
          talkId: input.talkId,
          message: input.message,
        });
      }
      // Is AI token, insert to ai message with this talk id
      else if ('token' in input) {
        const itemIndex = history.findIndex(
          (item) =>
            item.talkId === input.talkId && item.message._getType() === 'ai',
        );

        // Is the first token of this talk id & role
        if (itemIndex === -1) {
          history.push({
            talkId: input.talkId,
            message: new AIMessage({
              content: input.token,
            }),
          });
        } else {
          history[itemIndex].message.content += input.token;
        }
      }

      const newCacheData: FlowInteractionCache = {
        ...flowInteractionData!,
        history: history.map((v) => ({
          content: v.message.content.toString(),
          role: v.message._getType(),
          talkId: v.talkId,
        })),
      };

      flowInteractionData = newCacheData;

      console.log(
        history.map(
          (v) =>
            `[TALKID: ${v.talkId}] ${v.message._getType()}: ${
              v.message.content
            }`,
        ),
      );

      (async () => {
        try {
          await Promise.all([
            this.cacheService.set(
              flowInteractionCacheKey({ interactionId }),
              newCacheData,
            ),
            this.prismaService.flow_interaction.update({
              where: {
                id: interactionId,
              },
              data: {
                history: history
                  .filter(
                    (item) =>
                      ['ai', 'human'].includes(item.message._getType()) &&
                      typeof item.message.content === 'string',
                  )
                  .map<FlowInteractionHistory>((v) => ({
                    message: v.message.content as string,
                    role: v.message._getType() as 'human' | 'ai',
                  })),
              },
            }),
          ]);
        } catch {
          /** */
        }
      })();

      return history;
    };

    /**
     * This function will always be externally called to make sure
     * we downloaded the cache data for this call. Is already downloaded,
     * should not cost any time. Otherwise, will download the data and save it at the memory
     */
    const loadDataIfNeeded = async ({
      interactionId: interactionIdInput,
    }: {
      interactionId: string;
    }): Promise<FlowInteractionCache> => {
      // Already save in memory, just return in
      if (flowInteractionData) return flowInteractionData;

      // Save id to outside this block
      interactionId = interactionIdInput;

      // Read data from redis
      const fromCache = (await this.cacheService.get<FlowInteractionCache>(
        flowInteractionCacheKey({ interactionId }),
      ))!;

      // Update the history
      // and the interactionData in memory
      history.push(
        ...fromCache.history.map<(typeof history)[number]>((v) => {
          const c = v.role === 'ai' ? AIMessage : HumanMessage;

          return {
            message: new c({
              content: v.content,
            }),
            talkId: v.talkId,
          };
        }),
      );
      flowInteractionData = fromCache;
      return flowInteractionData!;
    };

    /**
     * Prompt User Message
     * After the user say something, will prompt the message to AI and then
     * to the text to speech provider
     */
    const promptUserMessage = async ({
      talkId,
      input,
    }: {
      talkId: string;
      input?: string;
    }) => {
      let newHistory = history;

      const { finishTextToSpeech, sendTextTokenToSpeech } =
        await setupTextToSpeech({
          talkId,
        });

      const tokenChars: string[] = [];

      let responseDone = false;
      let isThisTalkCancelled = false;

      /**
       * Create a interval that will check if the tokenChars has a sentence splitter
       * and then send to the text to speech provider
       */
      const checkInterval = setInterval(() => {
        for (const charIndex in tokenChars) {
          const char = tokenChars[Number(charIndex)];

          for (const splitter of this.sentenceSplitters) {
            if (char === splitter) {
              const sentence = tokenChars
                .splice(0, Number(charIndex) + 1)
                .join('');

              if (sentence) {
                pushToHistory({
                  token: sentence,
                  talkId,
                });

                // if (talkId) {
                // 	this.eventsHandler.emit('sentenceDetectedFromAiThinking', {
                // 		talkId,
                // 	});
                // }
                sendTextTokenToSpeech(sentence);
                if (isThisTalkCancelled) {
                  // Logger.debug('Last sentence sent to speech after cancelled');
                  clearInterval(checkInterval);
                  finishTextToSpeech();
                }
              }
            }
          }
        }

        /**
         * After response is done, send all the rest of tokens to provider and finish the connection with
         * the text to speech provider
         */
        if (responseDone) {
          const restOfTokens = tokenChars.join('');

          sendTextTokenToSpeech(restOfTokens);
          pushToHistory({
            token: restOfTokens,
            talkId,
          });
          clearInterval(checkInterval);
          finishTextToSpeech();
        }
      }, 1);

      /**
       * Subscribe to the interaction ended event, to force the clear of the interval
       */
      this.eventsHandler.subscribe(
        'interactionEnded',
        ({ connectionId: eventConnectionId }) => {
          if (eventConnectionId === connectionId) {
            clearInterval(checkInterval);
          }
        },
      );

      /**
       * Subscribe the event to stop talking if user say something
       * while the AI is talking
       */
      this.eventsHandler.subscribe(
        'cancelAiThinkingForTalkId',
        ({ talkId: eventTalkId }) => {
          // Logger.verbose(eventTalkId, 'cancelAiThinkingForTalkId');
          if (eventTalkId === talkId) {
            isThisTalkCancelled = true;
            // Is response is done, we need to sent a event to Text to Speech
            // to stop the current talk
            if (responseDone) {
              this.eventsHandler.emit('cancelSpeechToTextForTalkId', {
                talkId,
              });
            }
            // Otherwise, we just do nothing, because the interval
            // will interpret this var that we changed and generate the last sentence
            // and then stop the talk
          }
        },
      );

      let isFirstTokenReceived = true;

      // Setup model
      const llm = new ChatOpenAI({
        // model not necessary using Azure
        // modelName: 'gpt-3.5-turbo-0613',

        temperature: 0,
        topP: 0.5,
        maxTokens: 200,
        frequencyPenalty: 0,
        presencePenalty: 0,
        callbacks: [
          {
            handleLLMNewToken(token) {
              if (isFirstTokenReceived) {
                console.timeEnd('T3');
                console.time('T4');
                isFirstTokenReceived = false;
              }

              onTextToken?.(token);
              tokenChars.push(...token.split(''));
            },
          },
          ...(ENV.debugLangSmithOnFlow
            ? [
                setupLangSmithTracer({
                  projectNameSuffix: 'flow',
                }),
              ]
            : []),
        ],
        streaming: true,
      });

      const chatHistoryWithoutFirstSystemMessage = [
        // new SystemMessage(REINFORCED_SYSTEM_MESSAGE),
        ...newHistory.map((v) => v.message),
      ];

      // Memory for agent
      const memory = new OpenAIAgentTokenBufferMemory({
        llm,
        chatHistory: new ChatMessageHistory(
          chatHistoryWithoutFirstSystemMessage,
        ),
        memoryKey: 'chat_history',
        returnMessages: true,
        inputKey: 'input',
        outputKey: 'output',
      });

      // Setup the agent
      const executor = await initializeAgentExecutorWithOptions(
        this.loadTools({ ...params, flowInteractionData }).filter(
          Boolean,
        ) as DynamicTool[],
        llm,
        {
          agentType: 'openai-functions',
          maxIterations: 3,
          verbose: false,
          memory,
          returnIntermediateSteps: true,
          agentArgs: {
            prefix: flowInteractionData!.prompt,
          },
        },
      );

      console.timeEnd('T2');
      console.time('T3');
      // If input, we should push to history the input
      if (input) {
        newHistory = pushToHistory({
          message: new HumanMessage({
            content: input,
          }),
          talkId,
        });
      }

      let output: string;

      if (input) {
        // If input, we call the agent with it
        const res = await executor.call({ input });

        output = res.output as string;
      } else {
        // Without input, we don't use agents, we use only the model
        // So we need to add the first system message to the history
        // because the agent receives it by prefix param, and not the LLM.
        chatHistoryWithoutFirstSystemMessage.unshift(
          new SystemMessage(flowInteractionData.prompt!),
        );

        const { content } = await llm.call(
          chatHistoryWithoutFirstSystemMessage,
        );

        output = content as string;
      }

      responseDone = true;

      return output as string;
    };

    return { loadDataIfNeeded, promptUserMessage, history };
  }

  private loadTools(
    params: Parameters<(typeof this)['main']>[0] & {
      flowInteractionData: FlowInteractionCache;
    },
  ) {
    const { connectionId, getCallSid, flowInteractionData } = params;

    return [
      /**
       * Call management tools
       */
      new DynamicTool({
        name: 'endUpTheCall',
        description:
          'Whenever the user says "bye" or something like that, end up the call',
        func: async () => {
          this.eventsHandler.emit('interactionForceStopped', {
            connectionId,
          });

          if (getCallSid) {
            const unSubscribe = this.eventsHandler.subscribe(
              'talkIdCompleteSpeechToText',
              ({ talkId }) => {
                if (talkId === talkId) {
                  unSubscribe();
                  setTimeout(async () => {
                    await this.twilio.client
                      .calls(getCallSid())
                      .update({ status: 'completed' });
                  }, 3000);
                }
              },
            );

            return 'Say goodbye for the user. When you finish this message, the call will be ended.';
          } else {
            return 'This tool is not available in this context';
          }
        },
      }),
      /**
       * Calendar tools
       */
      ...(flowInteractionData.agent.calendar_integration
        ? [
            new DynamicStructuredTool({
              name: 'getCalendarAvailability',
              description: 'Get the calendar availability',
              func: async ({ from, to }) => {
                try {
                  const result =
                    await this.calendarIntegrationService.getAvailabilityForIntegration(
                      {
                        from: from ? new Date(from) : undefined,
                        to: to ? new Date(to) : undefined,
                      },
                      flowInteractionData.agent.calendar_integration,
                    );

                  return result;
                } catch {
                  return 'ERROR: Could not get calendar availability';
                }
              },
              schema: z.object({
                from: z
                  .string()
                  .nullable()
                  .describe(
                    'The start date, at the ISO format, if the user wants to specify',
                  ),
                to: z
                  .string()
                  .nullable()
                  .describe(
                    'The end date, at the ISO format, if the user wants to specify',
                  ),
              }),
            }),
            new DynamicStructuredTool({
              name: 'userHasEmailCreateCalendar',
              description: 'Call this only if you know the user email',
              func: async ({ end_date, start_date, email, name }) => {
                console.log(start_date, end_date, 'andre.gosling');
                try {
                  await this.calendarIntegrationService.createEventForIntegration(
                    {
                      end_at: end_date,
                      start_at: start_date,
                      email,
                      name,
                    },
                    flowInteractionData.agent.calendar_integration,
                  );

                  return 'Calendar event created';
                } catch (e) {
                  return `ERROR: Could not create the calendar event: ${JSON.stringify(
                    e.response.data,
                  )}`;
                }
              },
              schema: z.object({
                start_date: z
                  .string()
                  .describe(
                    'The start date, in the same format that you get from the getCalendarAvailability function',
                  ),
                end_date: z
                  .string()
                  .describe(
                    'The end date, in the same format that you get from the getCalendarAvailability function',
                  ),
                name: z.string().describe('The name of the event.'),
                email: z
                  .string()
                  .describe(
                    'The email of the user. Ask before calling the function if you dont have.',
                  ),
              }),
            }),
          ]
        : []),
    ];
  }
}
