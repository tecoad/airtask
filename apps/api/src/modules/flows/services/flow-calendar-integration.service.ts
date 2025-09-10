import { Injectable } from '@nestjs/common';
import { ValidationError } from 'apollo-server-express';
import {
	CreateFlowCalendarIntegrationInput,
	FlowCalendarIntegrationSettings__SavvyCal,
	FlowCalendarIntegrationType,
} from 'src/graphql';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { ID } from 'src/shared/types/db';
import { v4 } from 'uuid';
import * as z from 'zod';

const flowCalendarIntegrationSettingsSchema: z.ZodType<FlowCalendarIntegrationSettings__SavvyCal> =
	// z.union([
	z.object({
		type: z.literal(FlowCalendarIntegrationType.savvycall),
		link_id: z.string(),
		private_key: z.string(),
	});
// ]);

export type FlowCalendarIntegrationSettings = z.infer<
	typeof flowCalendarIntegrationSettingsSchema
>;

@Injectable()
export class FlowCalendarIntegrationService {
	constructor(private readonly prisma: PrismaService) {}

	create(input: CreateFlowCalendarIntegrationInput) {
		this.validateSettings(input.settings);

		return this.prisma.flow_integration_calendar.create({
			data: {
				id: v4(),
				...input,
				account: Number(input.account),
			},
		});
	}

	listForAccount(account: ID) {
		return this.prisma.flow_integration_calendar.findMany({
			where: {
				account: Number(account),
			},
		});
	}

	validateSettings(input: any) {
		try {
			const result = flowCalendarIntegrationSettingsSchema.parse(input);

			return result;
		} catch (error) {
			throw new ValidationError('Invalid input for calendar settings');
		}
	}
}
