import { ID } from '@directus/sdk';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { quotation } from '@prisma/client';
import { lastValueFrom } from 'rxjs';
import { ENV } from 'src/config/env';
import { OnBoardingStepName, WidgetConfigInput } from 'src/graphql';
import { OnBoardingStepsService } from 'src/modules/accounts/services/onboard-steps.service';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { EntityNotFoundError } from 'src/shared/errors/entity-not-found.error';

@Injectable()
export class WidgetConfigService {
	private logger = new Logger(WidgetConfigService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly onboardingSteps: OnBoardingStepsService,
		private readonly httpService: HttpService,
	) {}

	async updateForAccount(accountId: number, data: WidgetConfigInput) {
		const account = await this.prisma.account.findUniqueOrThrow({
				where: { id: accountId },
				include: {
					widget_config_account_widget_configTowidget_config: true,
				},
			}),
			config = account.widget_config_account_widget_configTowidget_config;

		this.onboardingSteps.queueEnsureStepForAccount(
			account.id,
			OnBoardingStepName.setup_widget_settings,
		);

		if (!config) {
			return this.prisma.widget_config.create({
				data: {
					...data,
					allowed_domains: data.allowed_domains || [],
					account_account_widget_configTowidget_config: {
						connect: {
							id: account.id,
						},
					},
				},
			});
		}

		return this.prisma.widget_config.update({
			where: {
				id: config!.id,
			},
			data: {
				...data,
				allowed_domains: data.allowed_domains || [],
			},
		});
	}

	async findForAccount(accountId: number) {
		const account = await this.prisma.account.findUniqueOrThrow({
				where: { id: accountId },
				include: {
					widget_config_account_widget_configTowidget_config: true,
				},
			}),
			config = account.widget_config_account_widget_configTowidget_config;

		return config;
	}

	async findForQuotationHashOrId(hash?: string, id?: ID) {
		const quotation = await this.prisma.quotation.findUnique({
			where: {
				...(id ? { id: String(id) } : { hash }),
			},
			include: {
				widget_config_quotation_widget_configTowidget_config: true,
			},
		});

		if (!quotation) {
			throw new EntityNotFoundError('quotation', (hash || id)!);
		}

		// Quotation has a widget config
		if (quotation.widget_config_quotation_widget_configTowidget_config) {
			return quotation.widget_config_quotation_widget_configTowidget_config;
		}

		if (!quotation.account) {
			throw new EntityNotFoundError('account', 'null');
		}

		return this.findForAccount(quotation.account);
	}

	async revalidateWidGetConfigForQuotation(_quotation: ID | quotation) {
		try {
			const quotation =
				typeof _quotation === 'object'
					? _quotation
					: await this.prisma.quotation.findUnique({
							where: {
								id: String(_quotation),
							},
					  });

			if (!quotation) return;

			await lastValueFrom(
				this.httpService.post(
					ENV.WIDGET.revalidate_quotation_script(quotation.hash),
					null,
					{
						headers: {
							Authorization: ENV.WIDGET.revalidate_account_script_secret!,
						},
					},
				),
			);
		} catch (e) {
			this.logger.error(e, 'Error at revalidateWidGetConfigForQuotation');
		}
	}

	async revalidateWidgetConfigForAccount(accountId: number) {
		try {
			const quotationsUsingThisAccountConfig = await this.prisma.quotation.findMany({
				where: {
					account: accountId,
					AND: {
						widget_config: null,
					},
				},
			});

			for (const quotation of quotationsUsingThisAccountConfig) {
				await this.revalidateWidGetConfigForQuotation(quotation);
			}
		} catch (e) {
			this.logger.error(e, 'Error at revalidateWidgetConfigForAccount');
		}
	}
}
