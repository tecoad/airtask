import { Injectable } from '@nestjs/common';
import { Prisma, quotation, quotation_question } from '@prisma/client';
import * as short from 'short-uuid';
import {
	AccountUsageKind,
	CreateQuotationInput,
	OnBoardingStepName,
	SoftDeleteQueryMode,
	UpdateQuotationInput,
} from 'src/graphql';
import { AccountPermissionsManagerService } from 'src/modules/accounts/services/account-permissions-manager.service';
import { OnBoardingStepsService } from 'src/modules/accounts/services/onboard-steps.service';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { UserJwtPayload } from 'src/modules/users/types';
import { ID } from 'src/shared/types/db';
import { v4 } from 'uuid';
import { WidgetConfigService } from './widget-config.service';

/**
 * Service to account quotations management
 */
@Injectable()
export class AccountQuotationsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly accountPermissionsManager: AccountPermissionsManagerService,
		private readonly onboardingSteps: OnBoardingStepsService,
		private readonly widgetConfigService: WidgetConfigService,
	) {}

	async create({ account, ...input }: CreateQuotationInput): Promise<quotation> {
		this.onboardingSteps.queueEnsureStepForAccount(
			Number(account),
			OnBoardingStepName.create_first_quotation,
		);

		return this.prisma.quotation.create({
			data: {
				id: v4(),
				hash: await this.generateHash(),
				account: Number(account),
				...input,
			},
		});
	}

	private async generateHash(): Promise<string> {
		const translator = short();

		let shortUid: string | null = null;

		while (!shortUid) {
			const hash = translator.new();
			const quotation = await this.prisma.quotation.findUnique({
				where: { hash },
			});

			if (!quotation) {
				shortUid = hash;
				break;
			}
		}

		return shortUid;
	}

	async update(
		{ id: userId }: UserJwtPayload,
		input: UpdateQuotationInput,
	): Promise<quotation> {
		const { id, widget_config, ...rest } = input;

		const quotation = await this.prisma.quotation.findUniqueOrThrow({
			where: { id: String(id) },
		});

		await this.accountPermissionsManager.throwIfUserIsNotAllowedToManageModuleInAccount(
			userId,
			quotation.account!,
			AccountUsageKind.quotation,
		);

		if (widget_config) {
			this.onboardingSteps.queueEnsureStepForAccount(
				quotation.account!,
				OnBoardingStepName.setup_widget_settings,
			);
		}

		if (
			// if value is null and diff than what is in DB, is an update
			(widget_config === null && widget_config !== quotation.widget_config) ||
			// if value is not null, then is an update of some property
			quotation.widget_config
		) {
			this.widgetConfigService.revalidateWidGetConfigForQuotation(quotation);
		}

		return this.prisma.quotation.update({
			where: { id: String(id) },
			data: {
				...(rest as Prisma.quotationUpdateInput),
				...(widget_config
					? {
							widget_config_quotation_widget_configTowidget_config: {
								upsert: {
									create: input.widget_config as Prisma.widget_configCreateInput,
									update: input.widget_config as Prisma.widget_configUpdateInput,
								},
							},
					  }
					: widget_config === null
					  ? {
								widget_config_quotation_widget_configTowidget_config: {
									delete: true,
								},
					    }
					  : {}),
			},
		});
	}

	async delete({ id: userId }: UserJwtPayload, id: ID): Promise<boolean> {
		const quotation = await this.prisma.quotation.findUniqueOrThrow({
			where: { id: String(id) },
		});

		await this.accountPermissionsManager.throwIfUserIsNotAllowedToManageModuleInAccount(
			userId,
			quotation.account!,
			AccountUsageKind.quotation,
		);

		await this.prisma.quotation.update({
			where: { id: String(id) },
			data: {
				date_deleted: new Date(),
			},
		});

		return true;
	}

	async find({ id: userId }: UserJwtPayload, id: ID): Promise<quotation | null> {
		const quotation = await this.prisma.quotation.findUnique({
			where: {
				id: String(id),
				date_deleted: null,
			},
		});

		if (!quotation) return null;

		await this.accountPermissionsManager.throwIfUserIsNotAllowedToReadModuleInAccount(
			userId,
			Number(quotation.account),
			AccountUsageKind.quotation,
		);

		return quotation;
	}

	async findAll(
		{ id: userId }: UserJwtPayload,
		accountId: ID,
		mode: SoftDeleteQueryMode,
	): Promise<quotation[]> {
		await this.accountPermissionsManager.throwIfUserIsNotAllowedToReadModuleInAccount(
			userId,
			Number(accountId),
			AccountUsageKind.quotation,
		);

		return this.prisma.quotation.findMany({
			where: {
				account: Number(accountId),
				date_deleted:
					// Any value, pass undefined
					mode === SoftDeleteQueryMode.show_all
						? undefined
						: // Show only deleted, with not null at date_deleted
						  mode === SoftDeleteQueryMode.show_only_deleted
						  ? {
									not: null,
						    }
						  : // Show only not deleted, without a date_deleted value
						    null,
			},
		});
	}

	async countRequests(quotationId: ID) {
		return this.prisma.quotation_request.count({
			where: {
				quotation_conversation_quotation_request_quotation_conversationToquotation_conversation:
					{
						quotation: String(quotationId),
					},
			},
		});
	}

	async modelBySegment(segmentId: number): Promise<
		| (quotation & {
				quotation_question_quotation_question_quotationToquotation: quotation_question[];
		  })
		| null
	> {
		try {
			const segment = await this.prisma.segment.findFirstOrThrow({
				where: {
					id: segmentId,
				},
			});

			const model = await this.prisma.quotation_models.findFirstOrThrow({
				where: {
					segment: segment.id,
				},
				include: {
					quotation_quotation_models_quotationToquotation: {
						include: {
							quotation_question_quotation_question_quotationToquotation: true,
						},
					},
				},
			});

			return model.quotation_quotation_models_quotationToquotation!;
		} catch {
			return null;
		}
	}
}
