import { FlowAgentVoice } from '@airtask/api/dist/graphql';
import { FlowInteractionCache } from '@airtask/api/dist/modules/flows/services/flow-interaction.service';
import { Injectable } from '@nestjs/common';
import * as WebSocket from 'ws';
import { callInMemoryEventsHandler } from '../gateways/flow-call.gateway';

@Injectable()
export class CallTextToSpeechHandlerService {
  get eventsHandler() {
    return callInMemoryEventsHandler;
  }

  main({
    onAudioStream,
    onFinalAudio,
    isPcmInputFormat,
    connectionId,
    getCacheData,
  }: {
    onAudioStream?: (base64: string) => Promise<void> | void;
    onFinalAudio?: (base64: string) => Promise<void> | void;
    isPcmInputFormat?: boolean;
    connectionId: string;
    getCacheData: () => FlowInteractionCache;
  }) {
    const activeSockets: { talkId: string; socket: WebSocket }[] = [];

    const setupTextToSpeech = async ({ talkId }: { talkId: string }) => {
      const data = getCacheData();

      let isThisTalkCancelled = false;
      const voiceId =
        data.voice === FlowAgentVoice.male
          ? '7es4G51klxhXBianwdJo'
          : 'PHegcQalb8Le4ABpCBzo';
      const model =
        data.agent.language === 'en'
          ? 'eleven_turbo_v2'
          : 'eleven_multilingual_v1';
      const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${model}&output_format=${
        isPcmInputFormat ? 'mp3_44100' : 'ulaw_8000'
      }&optimize_streaming_latency=3&enable_logging=false`;
      const bosMessage = {
        text: ' ',
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.0,
          style: 0,
          use_speaker_boost: false,
        },
        generation_config: {
          chunk_length_schedule: [50],
        },
        try_trigger_generation: true,
        xi_api_key: 'cf0f27ee6ef1e94f997571a6b9989bf0', // replace with your API key
      };

      const socket = new WebSocket(wsUrl);
      activeSockets.push({ talkId, socket });

      const waitOpen = new Promise((resolve) => {
        socket.on('open', async () => {
          // Logger.verbose('ElevenLabs open');
          resolve(true);
        });

        socket.on('close', () => {
          // Logger.verbose('Elevenlabs closed');
        });

        socket.on('error', () => {
          // console.log('error at elevenlabs');
        });
      });

      await waitOpen;

      let isFirst = true;

      socket.onmessage = (event) => {
        const audioResponse = JSON.parse(event.data as string);

        // Logger.verbose(
        // 	`Token from eleven labs isFinal=${
        // 		audioResponse.isFinal
        // 	}, isAudioPresent=${!!audioResponse.audio}`,
        // );

        if (audioResponse.audio) {
          if (isFirst) {
            console.timeEnd('T5');
            console.log('T6');
            console.log('-----------------');
            isFirst = false;
          }
          if (!isThisTalkCancelled) {
            onAudioStream?.(audioResponse.audio);
          }
        }

        if (audioResponse.isFinal) {
          this.eventsHandler.emit('talkIdCompleteSpeechToText', {
            talkId,
          });

          if (!isThisTalkCancelled) {
            onFinalAudio?.(audioResponse.audio);
          }

          const socketIndex = activeSockets.findIndex(
            (item) => item.talkId === talkId,
          );
          activeSockets.splice(socketIndex, 1);

          socket.close();
          socket.terminate();
        }
      };

      socket.send(JSON.stringify(bosMessage));

      let isFirstSent = false;

      const sendTextTokenToSpeech = (token: string) => {
        if (!token) return;

        if (!isFirstSent) {
          console.timeEnd('T4');
          console.time('T5');
          isFirstSent = true;
        }

        const textMessage = {
          text: token,
          try_trigger_generation: true,
        };

        // Logger.verbose(`----Sent to Speech: '${token}'`);

        // Logger.verbose(`Send token to eleven, ${JSON.stringify(textMessage)}`);

        socket.send(JSON.stringify(textMessage));
      };

      const finishTextToSpeech = () => {
        const eosMessage = {
          text: '',
        };

        // Logger.verbose('sended empty emssage to eleven');

        socket.send(JSON.stringify(eosMessage));
      };

      this.eventsHandler.subscribe(
        'cancelSpeechToTextForTalkId',
        ({ talkId: eventTalkId }) => {
          if (eventTalkId === talkId) {
            isThisTalkCancelled = true;

            finishTextToSpeech();
            socket.close();
            socket.terminate();
          }
        },
      );

      this.eventsHandler.subscribe(
        'interactionEnded',
        ({ connectionId: eventConnectionId }) => {
          if (eventConnectionId === connectionId && socket.OPEN) {
            finishTextToSpeech();
          }
        },
      );

      return {
        sendTextTokenToSpeech,
        finishTextToSpeech,
      };
    };

    return { setupTextToSpeech };
  }
}
