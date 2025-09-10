import { flowInteractionFirstAudioCacheKey } from '@airtask/api/dist/modules/flows/services/constants';
import { InMemoryEventsHandler } from '@airtask/api/dist/shared/utils/in-memory-events-handler';
import { UnwrapPromise } from '@prisma/client/runtime/library';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Logger } from '@nestjs/common';

import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Cache } from 'cache-manager';
import { IncomingMessage } from 'http';
import { v4 } from 'uuid';
import * as WebSocket from 'ws';
import { Server } from 'ws';
import { CallPromptUserMessagesHandlerService } from '../services/prompt-user-messages-handler.service';
import { CallVoiceRecognizerHandlerService } from '../services/voice-recognizer-handler.service';
import {
  CustomParameters,
  TwilioMediaFromEvents,
  TwilioMediaToEvents,
  TwilioMediaToMediaEvent,
} from './types';

export type FlowAudioStreamConnectionEventTypes = {
  cancelAiThinkingForTalkId: {
    talkId: string;
  };
  cancelSpeechToTextForTalkId: {
    talkId: string;
  };
  talkIdCompleteSpeechToText: {
    talkId: string;
  };
  interactionEnded: {
    connectionId: string;
  };
  interactionForceStopped: {
    connectionId: string;
  };
};

export const callInMemoryEventsHandler =
  new InMemoryEventsHandler<FlowAudioStreamConnectionEventTypes>();

export const FLOW_AUDIO_STREAM_GATEWAY_PATH = '/flow-audio-stream';

@WebSocketGateway({ path: FLOW_AUDIO_STREAM_GATEWAY_PATH })
export class FlowAudioStreamGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  get eventsHandler() {
    return callInMemoryEventsHandler;
  }

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private promptUserMessagesHandler: CallPromptUserMessagesHandlerService,
    private readonly voiceRecognizerHandler: CallVoiceRecognizerHandlerService,
  ) {}

  async handleConnection(
    @ConnectedSocket() client: WebSocket,
    message: IncomingMessage,
  ) {
    const { searchParams } = new URL(`https://sample.com${message.url || '/'}`),
      isPcmInputFormat = searchParams.get('inputFormat') === 'pcm',
      isDebugMode = searchParams.has('debug');

    const connectionId = v4();
    // Define data that will be updated after first message
    let streamSid: string, callSid: string, customParameters: CustomParameters;

    // Subscribe to end of socket to cancel all stuff
    client.on('close', () => {
      this.eventsHandler.emit('interactionEnded', {
        connectionId,
      });
    });

    // Load prompt user messages handler
    const { loadDataIfNeeded, promptUserMessage } =
      this.promptUserMessagesHandler.main({
        connectionId,
        onAudioStream(base64) {
          client.send(
            JSON.stringify(<TwilioMediaToMediaEvent>{
              event: 'media',
              media: {
                payload: base64,
              },
              streamSid,
            }),
          );
        },
        isPcmInputFormat,
        getCallSid() {
          return callSid;
        },
      });

    Logger.verbose('Connection', connectionId);

    // Every time the user talks, a new talkId is created
    // and then the AI will respond to it with the same talkId, so we can
    // track which talkId is running and cancel if needed
    const talkFlows: {
      id: string;
      isRunning: boolean;
    }[] = [
      // The call will always start with the AI talking
      {
        id: v4(),
        isRunning: true,
      },
    ];

    // If force to cancel speech to text, we will send a clear event to Twilio
    this.eventsHandler.subscribe(
      'cancelSpeechToTextForTalkId',
      ({ talkId }) => {
        if (talkFlows.some((i) => i.id === talkId)) {
          // Logger.warn('clear all event sent');
          client.send(
            JSON.stringify(<TwilioMediaToEvents>{
              event: 'clear',
              streamSid,
            }),
          );
        }
      },
    );

    let voiceRecognizerHandler: UnwrapPromise<
      ReturnType<CallVoiceRecognizerHandlerService['main']>
    >;

    // load voice recognizer handler

    client.on('message', async (message) => {
      const data: TwilioMediaFromEvents = JSON.parse(
        Buffer.from(message as any, 'binary').toString(),
      );

      // Logger.verbose(id, data);

      if (data.event === 'start') {
        streamSid = data.streamSid;
        callSid = data.start.callSid;
        customParameters = data.start.customParameters;

        const interactionCacheData = await loadDataIfNeeded({
          interactionId: customParameters!.interactionId,
        });

        voiceRecognizerHandler = await this.voiceRecognizerHandler.main({
          data: interactionCacheData,
          connectionId,
          async onStopTalking(phrase, talkId) {
            // If this is called before the data is loaded on startMessage, we need to make sure.
            // If data is already loaded, this function will not cost any time
            await loadDataIfNeeded({
              interactionId: customParameters!.interactionId,
            });

            if (isDebugMode) {
              client.send(
                JSON.stringify({
                  event: 'voice-recognized',
                  data: {
                    text: phrase,
                  },
                }),
              );
            }

            // Insert new talk flow
            talkFlows.push({
              id: talkId,
              isRunning: true,
            });

            const aiRes = await promptUserMessage({ input: phrase, talkId });

            if (isDebugMode) {
              client.send(
                JSON.stringify({
                  event: 'ai-response-created',
                  data: {
                    text: aiRes,
                  },
                }),
              );
            }
          },
          onStartTalking: () => {
            // Interrupt anything AI is talking
            for (const item of talkFlows) {
              if (item.isRunning) {
                // Logger.verbose(`Triggered cancelAiThinkingForTalkId for ${item.id}`);
                this.eventsHandler.emit('cancelAiThinkingForTalkId', {
                  talkId: item.id,
                });

                item.isRunning = false;
              }
            }
          },
          isPcmInputFormat,
        });

        const tryReadFirstAudio = await this.cacheService.get<string[]>(
          flowInteractionFirstAudioCacheKey({
            interactionId: customParameters!.interactionId,
          }),
        );
        if (tryReadFirstAudio) {
          for (const item of tryReadFirstAudio) {
            client.send(
              JSON.stringify(<TwilioMediaToMediaEvent>{
                event: 'media',
                media: {
                  payload: item,
                },
                streamSid,
              }),
            );
          }
        } else {
          // Logger.verbose('First prompt to AI');
          const aiRes = await promptUserMessage({
            talkId: talkFlows[0].id,
          });

          if (isDebugMode) {
            client.send(
              JSON.stringify({
                event: 'ai-response-created',
                data: {
                  text: aiRes,
                },
              }),
            );
          }
        }

        voiceRecognizerHandler.start();
      }

      if (data.event === 'media') {
        const buffer = Buffer.from(data.media.payload, 'base64');

        voiceRecognizerHandler?.pushBuffer(buffer);
      }

      if (data.event === 'stop') {
        voiceRecognizerHandler.close();
        this.eventsHandler.emit('interactionEnded', {
          connectionId,
        });
      }
    });
  }

  // handleDisconnect(@ConnectedSocket() client: WebSocket) {}
  handleDisconnect() {}
}
