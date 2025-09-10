import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { v4 } from 'uuid';

import { FlowInteractionCache } from '@airtask/api/dist/modules/flows/services/flow-interaction.service';
import { Injectable } from '@nestjs/common';
import { callInMemoryEventsHandler } from '../gateways/flow-call.gateway';

@Injectable()
export class CallVoiceRecognizerHandlerService {
  get eventsHandler() {
    return callInMemoryEventsHandler;
  }

  async main({
    onToken,
    onStopTalking,
    onStartTalking,
    isPcmInputFormat,
    connectionId,
    data,
  }: {
    onToken?: (token: string) => void;
    onStopTalking?: (phrase: string, talkId: string) => Promise<void> | void;
    onStartTalking?: () => void;
    isPcmInputFormat?: boolean;
    connectionId: string;
    data: FlowInteractionCache;
  }) {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.SPEECH_KEY!,
      process.env.SPEECH_REGION!,
    );
    speechConfig.speechRecognitionLanguage = data.agent.language || 'pt-BR';
    speechConfig.outputFormat = sdk.OutputFormat.Detailed;

    const pushStream = sdk.AudioInputStream.createPushStream(
      isPcmInputFormat
        ? sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1)
        : sdk.AudioStreamFormat.getWaveFormat(8000, 16, 1, 2),
    );

    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    const speechRecognizer = new sdk.SpeechRecognizer(
      speechConfig,
      audioConfig,
    );

    let isUserTalking = false;
    let currentTalkId: string | null = null;
    let isRecognizingCanceled = false;

    let tokensReconizingTimestamp: number[] = [];

    speechRecognizer.recognizing = (s, e) => {
      if (isRecognizingCanceled) return;

      onToken?.(e.result.text);

      tokensReconizingTimestamp.push(Date.now());

      console.log('>>recognizing');

      if (!currentTalkId) {
        currentTalkId = v4();
      }

      if (!isUserTalking) {
        isUserTalking = true;
        onStartTalking?.();
      }
    };

    // speechRecognizer.speechStartDetected = (s, e) => {
    //   // console.log('speechStartDetected');
    // };

    // speechRecognizer.speechEndDetected = (s, e) => {
    //   // console.log('speechEndDetected');
    //   // console.time('T1');
    // };

    speechRecognizer.recognized = (s, e) => {
      if (isRecognizingCanceled) return;

      // console.log(e.result.reason);
      if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
        let textResult: string;

        if (e.result.json) {
          const data = JSON.parse(e.result.json);
          console.log(data, 'result.data');

          textResult = data.NBest[0].Lexical;
        } else {
          textResult = e.result.text;
        }

        console.log('Text result', e.result.text);

        const lastTokenReconized =
          tokensReconizingTimestamp[tokensReconizingTimestamp.length - 1];
        tokensReconizingTimestamp = [];

        const now = Date.now();

        console.log('T1: ', now - lastTokenReconized);

        console.time('T2');
        onStopTalking?.(textResult, currentTalkId!);
        // Logger.debug(`Recognized: ${e.result.text}`);

        currentTalkId = null;

        if (isUserTalking) {
          isUserTalking = false;
        }
      }
    };

    const unSubscribe = this.eventsHandler.subscribe(
      'interactionForceStopped',
      ({ connectionId: eventConnectionId }) => {
        if (eventConnectionId === connectionId) {
          isRecognizingCanceled = true;
          unSubscribe();
        }
      },
    );

    return {
      pushBuffer(buffer: Buffer) {
        pushStream.write(buffer);
      },
      start() {
        speechRecognizer.startContinuousRecognitionAsync(
          () => {
            console.log('started speech recognizer');
          },
          (err) => {
            console.log('speech recognizer on error');
            console.log(err);
          },
        );
      },
      close() {
        speechRecognizer.stopContinuousRecognitionAsync();
        speechRecognizer.close();
        console.log('stopped speech recognizer');
        pushStream.close();
      },
    };
  }
}
