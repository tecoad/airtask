import { FlowCalendarIntegrationType } from '@airtask/api/dist/graphql';
import { PrismaService } from '@airtask/api/dist/modules/common/services/prisma.service';
import { FlowCalendarIntegrationSettings } from '@airtask/api/dist/modules/flows/services/flow-calendar-integration.service';
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CalendarIntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailabilityForIntegration(
    { from, to }: { from?: Date; to?: Date },
    settings: FlowCalendarIntegrationSettings,
  ): Promise<string> {
    let result:
      | { start: string; end: string; durationInMinutes: number }[]
      | null = null;

    switch (settings.type) {
      case FlowCalendarIntegrationType.savvycall: {
        type Result = { duration: number; end_at: string; start_at: string }[];
        const { data } = await axios.get<Result>(
          `https://api.savvycal.com/v1/links/${settings.link_id}/slots`,
          {
            headers: {
              Authorization: `Bearer ${settings.private_key}`,
            },
          },
        );

        result = data.map((v) => ({
          durationInMinutes: v.duration,
          start: v.start_at,
          end: v.end_at,
        }));

        break;
      }
    }

    if (!result) {
      throw new Error('Invalid calendar integration type');
    }

    return result
      .filter((item) => {
        if (from) {
          return new Date(item.start) >= from;
        } else if (to) {
          return new Date(item.end) <= to;
        } else if (from && to) {
          return (
            new Date(item.start) >= new Date(from) &&
            new Date(item.end) <= new Date(to)
          );
        } else {
          return true;
        }
      })
      .slice(0, 4)
      .map((v) => `Starts: ${v.start}, ends: ${v.end}`)
      .join(', ');
  }

  async createEventForIntegration(
    options: {
      name: string;
      email: string;
      start_at: string;
      end_at: string;
    },
    settings: FlowCalendarIntegrationSettings,
  ) {
    switch (settings.type) {
      case FlowCalendarIntegrationType.savvycall: {
        const { data } = await axios.post(
          `https://api.savvycal.com/v1/links/${settings.link_id}/events`,
          {
            display_name: options.name,
            email: options.email,
            start_at: options.start_at,
            end_at: options.end_at,
            time_zone: 'GMT',
          },
          {
            headers: {
              Authorization: `Bearer ${settings.private_key}`,
            },
          },
        );

        return data;
      }
    }

    throw new Error('Invalid calendar integration type');
  }
}
