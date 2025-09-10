import { UseGuards } from '@nestjs/common';
import { Args, Mutation, ResolveField, Resolver } from '@nestjs/graphql';
import { flow_contact, flow_contact_segment } from '@prisma/client';
import { ValidationError } from 'apollo-server-express';
import { FileUpload } from 'graphql-upload';
import {
	AccountUsageKind,
	BatchUpdateFlowContact,
	ImportFlowContactsFromCsvInput,
	ImportFlowContactsFromCsvResult,
	ToggleFlowContactInSegmentInput,
} from 'src/graphql';
import { AccountPermissionsManagerService } from 'src/modules/accounts/services/account-permissions-manager.service';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { FlowsContactsService } from 'src/modules/flows/services/flows-contacts.service';
import { UserGqlAuthGuard } from 'src/modules/users/auth/user-auth.guard';
import { UserJwtPayload } from 'src/modules/users/types';
import { CurrentUser } from 'src/shared/decorators';
import { EntityNotFoundError } from 'src/shared/errors';

@Resolver('FlowContact')
export class AccountFlowsContactsResolver {
	constructor(
		private readonly flowsContactsService: FlowsContactsService,
		private readonly accountPermissionsManager: AccountPermissionsManagerService,
		private readonly prisma: PrismaService,
	) {}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async importFlowContactsFromCsv(
		@CurrentUser() user: UserJwtPayload,
		@Args('input') input: ImportFlowContactsFromCsvInput,
		@Args('csv') csv: { file: FileUpload }[],
	): Promise<ImportFlowContactsFromCsvResult> {
		await this.accountPermissionsManager.throwIfUserIsNotAllowedToManageModuleInAccount(
			user.id,
			Number(input.account),
			AccountUsageKind.flow,
		);

		const upload = Array.isArray(csv) ? csv[0] : csv;

		if ('promise' in upload) {
			await upload.promise;
		}
		await upload;
		const { file } = upload;

		return this.flowsContactsService.importManyFromCsv(
			user,
			input,
			file.createReadStream(),
		);
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async batchUpdateFlowContact(
		@CurrentUser() user: UserJwtPayload,
		@Args('input') input: BatchUpdateFlowContact[],
	) {
		const result: flow_contact[] = [];

		for (const itemInput of input) {
			const item = await this.flowsContactsService.find(itemInput.id);

			if (!item) throw new EntityNotFoundError('flow_contact', itemInput.id);

			await this.accountPermissionsManager.throwIfUserIsNotAllowedToManageModuleInAccount(
				user.id,
				item.account,
				AccountUsageKind.flow,
			);

			const itemResult = await this.flowsContactsService.update(itemInput);

			result.push(itemResult);
		}

		return result;
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async toggleFlowContactInSegment(
		@CurrentUser() user: UserJwtPayload,
		@Args('input') input: ToggleFlowContactInSegmentInput,
	) {
		const segment = await this.prisma.flow_contact_segment.findUnique({
			where: {
				id: input.segmentId,
			},
		});
		if (!segment) throw new EntityNotFoundError('flow_contact_segment', input.segmentId);

		for (const contactId of input.contactId) {
			const item = await this.flowsContactsService.find(contactId);

			if (!item) throw new EntityNotFoundError('flow_contact', contactId);

			await this.accountPermissionsManager.throwIfUserIsNotAllowedToManageModuleInAccount(
				user.id,
				item.account,
				AccountUsageKind.flow,
			);

			// This make sure the account is always for an account that the user has access to
			// and also for the same account as the contact
			if (item.account !== segment.account) {
				throw new ValidationError('error.contact-and-segment-accounts-must-be-the-same');
			}
		}

		return this.flowsContactsService.toggleContactsOnSegment(input);
	}

	@ResolveField()
	async segments(parent: flow_contact): Promise<flow_contact_segment[]> {
		const m2m = await this.prisma.flow_contact_flow_contact_segment.findMany({
			where: {
				flow_contact_id: parent.id,
				flow_contact_segment: {
					date_deleted: null,
				},
			},
			include: {
				flow_contact_segment: true,
			},
		});

		return m2m.flatMap((v) => (v.flow_contact_segment ? v.flow_contact_segment : []));
	}
}
