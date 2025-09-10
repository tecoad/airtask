import { Injectable } from '@nestjs/common';
import { subscription_plan } from '@prisma/client';
import { PrismaService } from 'src/modules/common/services/prisma.service';

@Injectable()
export class SubscriptionPlanService {
	constructor(private readonly prisma: PrismaService) {}

	async listAll(): Promise<Pick<subscription_plan, 'id' | 'name'>[]> {
		const plans = await this.prisma.subscription_plan.findMany({
			where: {
				is_active: true,
			},
		});

		return plans;
	}

	async planPrice(plan: subscription_plan) {
		const planPrices = await this.prisma.subscription_plan_price.findMany({
			where: {
				plan: plan.id,
			},
		});

		return planPrices;
	}
}
