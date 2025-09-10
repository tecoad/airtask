import { PrismaService } from '@airtask/api/dist/modules/common/services/prisma.service';
import { TwilioService } from '@airtask/api/dist/modules/common/services/twilio.service';
import { Module } from '@nestjs/common';

const providersAndExports = [PrismaService, TwilioService];

@Module({
  providers: [...providersAndExports],
  exports: [...providersAndExports],
})
export class CommonModule {}
