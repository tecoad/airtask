import { ENV } from '@/config/env';
import { FLOW_CALL_RECORDING_STATUS_CALLBACK_PATH } from '@airtask/api/dist/modules/flows/constants/routes';
import { flowInteractionFirstAudioCacheKey } from '@airtask/api/dist/modules/flows/services/constants';
import {
  makeSureStringEndsWithSlash,
  makeSureStringNotStartsWithSlash,
} from '@airtask/api/dist/shared/utils/url';
import {
  FLOW_CALL_HANDLER_PATH,
  FLOW_CALL_HANDLER_XML_PATH,
  GENERATE_FIRST_TALK_IN_INTERACTION,
} from '@airtask/shared/dist/flow/constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Controller, Get, Inject, Param, Post, Req, Res } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Request, Response } from 'express';
import * as twilio from 'twilio';
import { twiml } from 'twilio';
import { v4 } from 'uuid';
import { FLOW_AUDIO_STREAM_GATEWAY_PATH } from '../gateways/flow-call.gateway';
import { CallPromptUserMessagesHandlerService } from '../services/prompt-user-messages-handler.service';
import { TwilioGetTwimlParameters } from './types';

@Controller(FLOW_CALL_HANDLER_PATH)
export class CallHandlerController {
  public client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN,
  );

  constructor(
    private promptUserMessagesHandler: CallPromptUserMessagesHandlerService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) {}

  @Get(FLOW_CALL_HANDLER_XML_PATH[1].replace('/:interactionId', ''))
  async handleInbound(
    @Req() req: Request<any, any, any, TwilioGetTwimlParameters>,
    @Res() res: Response,
  ) {
    this.handleOutbound(req, res, 'c7e9b9c4-c32f-4934-916a-3ffd6d09278b');
  }

  @Get(FLOW_CALL_HANDLER_XML_PATH[1])
  async handleOutbound(
    @Req() req: Request<any, any, any, TwilioGetTwimlParameters>,
    @Res() res: Response,
    @Param('interactionId') interactionId: string,
  ) {
    const response = new twiml.VoiceResponse();

    const connect = response.connect();

    const stream = connect.stream({
      url: `wss://${req.hostname}${FLOW_AUDIO_STREAM_GATEWAY_PATH}`,
    });

    stream.parameter({
      name: 'interactionId',
      value: interactionId,
    });

    if (req.query.CallSid) {
      this.client
        .calls(req.query.CallSid)
        .recordings.create({
          recordingStatusCallback:
            makeSureStringEndsWithSlash(ENV.API.url!) +
            makeSureStringNotStartsWithSlash(
              FLOW_CALL_RECORDING_STATUS_CALLBACK_PATH.join(''),
            ),
          recordingStatusCallbackMethod: 'POST',
          trim: 'trim-silence',
        })
        .then(console.log);
    }

    res.setHeader('Content-Type', 'text/xml');
    res.send(response.toString());
  }

  @Post(GENERATE_FIRST_TALK_IN_INTERACTION[1])
  async generateFirstTalkInInteraction(
    @Param('interactionId') interactionId: string,
    @Res() res: Response,
  ) {
    const audios: string[] = [];

    const { loadDataIfNeeded, promptUserMessage } =
      this.promptUserMessagesHandler.main({
        connectionId: v4(),
        onAudioStream(base64) {
          audios.push(base64);
        },
        onFinalAudio: async () => {
          // Update in redis
          await this.cacheService.store.set(
            flowInteractionFirstAudioCacheKey({
              interactionId,
            }),
            audios,
            // 24 hours
            { ttl: 3600 * 24 } as any,
          );

          res.send({
            success: true,
          });
          res.end();
        },
      });

    await loadDataIfNeeded({ interactionId });

    await promptUserMessage({
      talkId: v4(),
    });
  }
}
