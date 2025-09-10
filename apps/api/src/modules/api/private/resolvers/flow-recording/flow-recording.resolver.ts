import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { flow_interaction_recording } from '@prisma/client';
import { PrismaService } from 'src/modules/common/services/prisma.service';

@Resolver('FlowRecording')
export class FlowRecordingResolver {
	constructor(private readonly prisma: PrismaService) {}

	@ResolveField()
	async flow(@Parent() parent: flow_interaction_recording) {
		const interaction = await this.prisma.flow_interaction.findUnique({
			where: {
				id: parent.interaction,
			},
			include: {
				flow_flow_interaction_flowToflow: true,
			},
		});

		return interaction?.flow_flow_interaction_flowToflow;
	}

	@ResolveField()
	async contact_name(@Parent() parent: flow_interaction_recording) {
		const interaction = await this.prisma.flow_interaction.findUnique({
			where: {
				id: parent.interaction,
			},
			select: {
				contact_name: true,
			},
		});

		return interaction?.contact_name;
	}

	@ResolveField()
	async contact_phone(@Parent() parent: flow_interaction_recording) {
		const interaction = await this.prisma.flow_interaction.findUnique({
			where: {
				id: parent.interaction,
			},
			select: {
				contact_phone: true,
			},
		});

		return interaction?.contact_phone;
	}

	@ResolveField()
	record(@Parent() parent: flow_interaction_recording) {
		return this.prisma.directus_files.findUnique({
			where: {
				id: parent.file,
			},
		});
	}
}
