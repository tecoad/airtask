import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { quotation, quotation_question } from '@prisma/client';
import {
	AccountUsageKind,
	CreateQuotationInput,
	CreateQuotationQuestionInput,
	SoftDeleteQueryMode,
	UpdateQuotationInput,
	UpdateQuotationQuestionInput,
} from 'src/graphql';
import { AccountPermissionsManagerService } from 'src/modules/accounts/services/account-permissions-manager.service';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { UserGqlAuthGuard } from 'src/modules/users/auth/user-auth.guard';
import { UserJwtPayload } from 'src/modules/users/types';
import { CurrentUser } from 'src/shared/decorators';
import { ID } from 'src/shared/types/db';
import { AccountQuotationsQuestionsService } from '../../../../quotations/services/account-quotations-questions.service';
import { AccountQuotationsService } from '../../../../quotations/services/account-quotations.service';

@Resolver('Quotation')
export class AccountQuotationsResolver {
	constructor(
		private readonly accountQuotationsService: AccountQuotationsService,
		private readonly accountQuotationsQuestionsService: AccountQuotationsQuestionsService,
		private readonly accountPermissionsManager: AccountPermissionsManagerService,

		private readonly prisma: PrismaService,
	) {}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async createQuotation(
		@CurrentUser() user: UserJwtPayload,
		@Args('input') input: CreateQuotationInput,
	) {
		await this.accountPermissionsManager.throwIfUserIsNotAllowedToManageModuleInAccount(
			user.id,
			Number(input.account),
			AccountUsageKind.quotation,
		);

		return this.accountQuotationsService.create(input);
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async createQuotationQuestion(
		@CurrentUser() user: UserJwtPayload,
		@Args('input')
		_input: CreateQuotationQuestionInput[] | CreateQuotationQuestionInput,
	) {
		const input = Array.isArray(_input) ? _input : [_input];

		for (const { quotation } of input) {
			if (input.find((item) => item.quotation !== quotation)) {
				throw new Error('All questions must belong to the same quotation');
			}
		}

		const result: quotation_question[] = [];
		for (const i of input) {
			const r = await this.accountQuotationsQuestionsService.create(user, i);
			result.push(...r);
		}

		return result;
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	updateQuotationQuestion(
		@CurrentUser() user: UserJwtPayload,
		@Args('input') input: UpdateQuotationQuestionInput,
	) {
		return this.accountQuotationsQuestionsService.update(user, input);
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	deleteQuotationQuestion(@CurrentUser() user: UserJwtPayload, @Args('id') id: ID) {
		return this.accountQuotationsQuestionsService.delete(user, id);
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	updateQuotation(
		@CurrentUser() user: UserJwtPayload,
		@Args('input') input: UpdateQuotationInput,
	) {
		return this.accountQuotationsService.update(user, input);
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	deleteQuotation(@CurrentUser() user: UserJwtPayload, @Args('id') id: ID) {
		return this.accountQuotationsService.delete(user, id);
	}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	accountQuotation(@CurrentUser() user: UserJwtPayload, @Args('id') id: ID) {
		return this.accountQuotationsService.find(user, id);
	}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	accountQuotations(
		@CurrentUser() user: UserJwtPayload,
		@Args('account') account: ID,
		@Args('mode') mode: SoftDeleteQueryMode,
	) {
		return this.accountQuotationsService.findAll(user, account, mode);
	}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	quotationModelBySegment(@Args('segmentId') segmentId: string) {
		return this.accountQuotationsService.modelBySegment(Number(segmentId));
	}

	@ResolveField('questions')
	async questions(
		@Parent()
		quotation: quotation & {
			quotation_question_quotation_question_quotationToquotation:
				| quotation_question[]
				| undefined;
		},
	): Promise<quotation_question[]> {
		// If the questions are already loaded, return them
		if (quotation.quotation_question_quotation_question_quotationToquotation) {
			return quotation.quotation_question_quotation_question_quotationToquotation;
		}

		return this.accountQuotationsQuestionsService.listAll(quotation.id);
	}

	@ResolveField('questions_count')
	async questionsCount(@Parent() quotation: quotation) {
		return this.accountQuotationsQuestionsService.count(quotation.id);
	}

	@ResolveField('requests_count')
	async requestsCount(@Parent() quotation: quotation) {
		return this.accountQuotationsService.countRequests(quotation.id);
	}

	@ResolveField('widget_config')
	async widgetConfig(@Parent() quotation: quotation) {
		return (
			quotation.widget_config &&
			this.prisma.widget_config.findUnique({
				where: {
					id: quotation.widget_config,
				},
			})
		);
	}
}
