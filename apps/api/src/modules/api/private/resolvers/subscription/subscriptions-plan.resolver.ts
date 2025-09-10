import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { subscription_plan } from '@prisma/client';
import { SubscriptionPlanService } from 'src/modules/subscriptions/services/subscription-plan.service';

@Resolver('SubscriptionPlan')
export class SubscriptionPlanResolver {
	constructor(private readonly subscriptionPlanService: SubscriptionPlanService) {}

	@Query()
	async subscriptionPlans() {
		return this.subscriptionPlanService.listAll();
	}

	@ResolveField('prices')
	async prices(@Parent() plan: subscription_plan) {
		return this.subscriptionPlanService.planPrice(plan);
	}
}
