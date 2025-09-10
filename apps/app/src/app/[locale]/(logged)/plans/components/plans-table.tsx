import { PricingCard, PricingCardData } from './pricing-card';

type Props = {
	plans: PricingCardData[];
};

export const PlansTables = (props: Props) => {
	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
			{props.plans.map((v, k) => (
				<PricingCard
					ui={{
						className: `w-full   ${
							v.name === 'Standard'
								? 'bg-foreground/80 text-background'
								: 'bg-foreground/10 text-foreground'
						}`,
					}}
					key={k}
					data={v}
				/>
			))}
		</div>
	);
};
