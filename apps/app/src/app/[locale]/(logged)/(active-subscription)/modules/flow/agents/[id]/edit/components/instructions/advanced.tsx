import { StepsProps } from './steps';

const AdvancedStepsContent: StepsProps[] = [
	{
		title: 'Tips for using advanced editor',
		content: (
			<>
				<ul className="list-inside list-disc">
					<li className="text-foreground">
						{`Although you are using advanced model, we highly recommend you model our template prompts. There are lot of tiny, simple things we do that are crucial to Air working.`}
					</li>
					<li className="text-foreground">
						{`VITAL for appointment booking: Make sure to place the variable {calendarAvailabilities} wherever you want cal.com’s API to place available times for appointments. Without this, Air will have no way of knowing what times are available. You can reference our default prompts to see how we execute this personally.`}
					</li>
					<li className="text-foreground">
						{`When you want Air to stop speaking and wait for your contact to respond just paste “*Wait For Prospect To Respond*” on the next line. Without this, Air will often read multiple parts of your script at the same time.`}
					</li>
					<span className="text-sm">
						(Reference how we do this in the template prompt and take note of the
						paragraph we have in the instructions that causes Air to follow this
						instruction closely.)
					</span>
				</ul>
			</>
		),
	},
];

export default AdvancedStepsContent;
