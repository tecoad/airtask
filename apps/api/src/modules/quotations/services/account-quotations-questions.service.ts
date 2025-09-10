import { Injectable } from '@nestjs/common';
import {
	AccountUsageKind,
	CreateQuotationQuestionChildrenInput,
	CreateQuotationQuestionInput,
	UpdateQuotationQuestionInput,
} from 'src/graphql';
import { AccountPermissionsManagerService } from 'src/modules/accounts/services/account-permissions-manager.service';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { UserJwtPayload } from 'src/modules/users/types';
import { ID } from 'src/shared/types/db';
import { v4 } from 'uuid';

@Injectable()
export class AccountQuotationsQuestionsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly accountPermissionsManager: AccountPermissionsManagerService,
	) {}

	async create(user: UserJwtPayload, input: CreateQuotationQuestionInput) {
		const quotationId = String(input.quotation);

		const quotation = await this.prisma.quotation.findUniqueOrThrow({
			where: { id: quotationId },
		});

		await this.accountPermissionsManager.throwIfUserIsNotAllowedToManageModuleInAccount(
			user.id,
			quotation.account!,
			AccountUsageKind.quotation,
		);

		return this.createRecursive(input);
	}

	private async createRecursive(
		input:
			| CreateQuotationQuestionInput
			| (CreateQuotationQuestionChildrenInput & {
					quotation: ID;
					parent?: ID;
			  }),
	) {
		const { label, quotation, children, parent, order, condition } = input;

		const createdQuestion = await this.prisma.quotation_question.create({
			data: {
				id: v4(),
				label,
				quotation: String(quotation),
				parent: parent as string,
				condition,
				order,
			},
		});

		let createdQuestions = [createdQuestion];

		if (children) {
			// Create children questions
			for (const child of children) {
				const childQuestions = await this.createRecursive({
					...child,
					parent: createdQuestion.id,
					quotation,
				});

				createdQuestions = [...createdQuestions, ...childQuestions];
			}
		}

		return createdQuestions;
	}

	async update(user: UserJwtPayload, input: UpdateQuotationQuestionInput) {
		const question = await this.prisma.quotation_question.findUniqueOrThrow({
			where: {
				id: input.id,
			},
		});

		const quotation = await this.prisma.quotation.findUniqueOrThrow({
			where: { id: question.quotation! },
		});

		await this.accountPermissionsManager.throwIfUserIsNotAllowedToManageModuleInAccount(
			user.id,
			quotation.account!,
			AccountUsageKind.quotation,
		);

		const { id, ...rest } = input;

		return this.prisma.quotation_question.update({
			where: {
				id,
			},
			data: {
				...(rest as any),
			},
		});
	}

	async delete(user: UserJwtPayload, id: ID) {
		const question = await this.prisma.quotation_question.findUniqueOrThrow({
			where: {
				id: id as string,
			},
		});

		const quotation = await this.prisma.quotation.findUniqueOrThrow({
			where: { id: question.quotation! },
		});

		await this.accountPermissionsManager.throwIfUserIsNotAllowedToManageModuleInAccount(
			user.id,
			quotation.account!,
			AccountUsageKind.quotation,
		);

		await this.deleteRecursive(id);

		return true;
	}

	private async deleteRecursive(id: ID) {
		// Delete children
		const children = await this.prisma.quotation_question.findMany({
			where: {
				parent: id as string,
			},
		});

		for (const child of children) {
			await this.deleteRecursive(child.id);
		}

		// Delete question
		await this.prisma.quotation_question.delete({
			where: {
				id: id as string,
			},
		});
	}

	async listAll(quotationId: ID) {
		return this.prisma.quotation_question.findMany({
			where: { quotation: String(quotationId) },
		});
	}

	async count(quotationId: ID) {
		return this.prisma.quotation_question.count({
			where: { quotation: String(quotationId) },
		});
	}
}
