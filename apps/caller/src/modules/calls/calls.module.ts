import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { CallHandlerController } from './controllers/call-handler.controller';
import { FlowAudioStreamGateway } from './gateways/flow-call.gateway';
import { CalendarIntegrationsService } from './services/calendar-integrations.service';
import { CallPromptUserMessagesHandlerService } from './services/prompt-user-messages-handler.service';
import { CallTextToSpeechHandlerService } from './services/text-to-speech-handler.service';
import { CallVoiceRecognizerHandlerService } from './services/voice-recognizer-handler.service';

@Module({
  imports: [CommonModule],
  controllers: [CallHandlerController],
  providers: [
    FlowAudioStreamGateway,
    CallPromptUserMessagesHandlerService,
    CallTextToSpeechHandlerService,
    CallVoiceRecognizerHandlerService,
    CalendarIntegrationsService,
  ],
})
export class CallsModule {}
