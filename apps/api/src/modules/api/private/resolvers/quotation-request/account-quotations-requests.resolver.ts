import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { quotation_request } from '@prisma/client';
import { QuotationRequestData } from 'src/modules/quotations/types';

import { ID } from '@directus/sdk';
import { UseGuards } from '@nestjs/common';
import {
	AccountUsageKind,
	QuotationRequestData as GqlQuotationRequestData,
} from 'src/graphql';
import { AccountPermissionsManagerService } from 'src/modules/accounts/services/account-permissions-manager.service';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { AccountQuotationsRequestsService } from 'src/modules/quotations/services/account-quotations-requests.service';
import { UserGqlAuthGuard } from 'src/modules/users/auth/user-auth.guard';
import { UserJwtPayload } from 'src/modules/users/types';
import { CurrentUser } from 'src/shared/decorators';

@Resolver('QuotationRequest')
export class AccountQuotationRequestResolver {
	constructor(
		private readonly prisma: PrismaService,
		private readonly accountPermissionsService: AccountPermissionsManagerService,
		private readonly accountQuotationsRequestsService: AccountQuotationsRequestsService,
	) {}

	@Query()
	@UseGuards(UserGqlAuthGuard)
	async accountQuotationRequest(
		@CurrentUser() user: UserJwtPayload,
		@Args('quotationId') quotationId: ID,
		@Args('requestSequentialId') requestSequentialId: ID,
	) {
		const item = await this.accountQuotationsRequestsService.findBySequential(
			quotationId,
			requestSequentialId,
		);

		if (!item) return null;

		await this.accountPermissionsService.throwIfUserIsNotAllowedToReadModuleInAccount(
			user.id,
			item.account!,
			AccountUsageKind.quotation,
		);

		return item;
	}

	@ResolveField('data')
	async fieldData(@Parent() request: quotation_request) {
		const answersByQuestion = request.request_data as QuotationRequestData;

		const questions = Object.keys(answersByQuestion);

		return questions.map<GqlQuotationRequestData>((question) => ({
			question,
			answer: answersByQuestion[question],
		}));
	}

	@ResolveField('conversation')
	async fieldConversation(@Parent() request: quotation_request) {
		return (
			request.quotation_conversation &&
			this.prisma.quotation_conversation.findFirst({
				where: {
					id: request.quotation_conversation,
				},
			})
		);
	}

	@ResolveField('quotation')
	async quotation(@Parent() request: quotation_request) {
		return (
			request.quotation &&
			this.prisma.quotation.findFirst({
				where: {
					id: request.quotation,
				},
			})
		);
	}

	@ResolveField('checked_by')
	async fieldCheckedBy(@Parent() request: quotation_request) {
		return (
			request.checked_by &&
			this.prisma.user.findFirst({
				where: {
					id: request.checked_by,
				},
			})
		);
	}

	@ResolveField('visualized_at')
	async visualized(
		@Parent() request: quotation_request,
		@CurrentUser() user: UserJwtPayload,
	) {
		const view = await this.accountQuotationsRequestsService.isRequestVisualizedForUser(
			request,
			user.id,
		);

		if (view) {
			return view.date_created;
		}
	}

	@Mutation()
	@UseGuards(UserGqlAuthGuard)
	async toggleQuotationRequestCheck(
		@Args('requestId') requestIds: ID[],
		@CurrentUser() user: UserJwtPayload,
	) {
		const results: quotation_request[] = [];

		for (const requestId of requestIds) {
			const item = await this.accountQuotationsRequestsService.find(requestId);

			if (item) {
				await this.accountPermissionsService.throwIfUserIsNotAllowedToReadModuleInAccount(
					user.id,
					item.account!,
					AccountUsageKind.quotation,
				);

				const result = await this.accountQuotationsRequestsService.toggleCheck(
					user,
					item,
				);

				results.push(result);
			}
		}

		return results;
	}

	@Mutation()
	@UseGuards(UserGqlAuthGuard)
	async visualizeQuotationRequest(
		@Args('requestId') requestIds: ID[],
		@CurrentUser() user: UserJwtPayload,
	): Promise<boolean> {
		for (const requestId of requestIds) {
			const item = await this.accountQuotationsRequestsService.find(requestId);

			if (item) {
				await this.accountPermissionsService.throwIfUserIsNotAllowedToReadModuleInAccount(
					user.id,
					item.account!,
					AccountUsageKind.quotation,
				);

				await this.accountQuotationsRequestsService.visualizeRequest(item, user.id);
			}
		}

		return true;
	}
}
