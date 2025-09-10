import { CopyButton } from '@/components/copy-button';
import { StepsProps } from './steps';

const DefaultStepsContent: StepsProps[] = [
	{
		title: 'Vital tips on how to type',
		content: (
			<>
				<ul className="list-inside list-disc">
					<li className="text-foreground">
						{`Don't type out ANY symbols or else you may confuse your AI:`}
					</li>
					<li>Instead of “$” type out “dollar”.</li>
					<li>Instead of “%” type out “percent”</li>
					<li>Instead of “1-10” type out “one to ten”.</li>
					<li>Instead of “Air.ai” type out “Air dot AI”.</li>
					{/* <Separator className="my-4 bg-transparent" /> */}
					<li className="text-foreground mt-6">
						When typing acronyms make sure to space them out.
					</li>
					<span className="text-sm">
						Instead of “PDF” type out “P D F.” This is easier for your Air to understand.
					</span>
					<li className="text-foreground mt-6">
						Avoid starting lines in your script with fillers like “uhhh”, “ummm”, “yah”,
						etc.
					</li>
					<span className="text-sm">
						{`Air does this automatically when it's thinking so by adding them in your
						script, Air might accidentally repeat itself.`}
					</span>
				</ul>
			</>
		),
	},
	{
		title: 'How to insert variables',
		content: (
			<>
				<ul className="list-inside list-disc">
					<li className="text-foreground">
						{`Use {prospectName} to dynamically insert the prospects name into the script.
						Ex: “Hey, {prospectName}!”`}
					</li>
					<span className="text-sm">
						{`**Note: {prospectName} is the only contact variable Air currently supports. We will be adding more (email, phone #, etc) in some of our next few updates.`}
					</span>

					<li className="text-foreground mt-6">
						{`If you have a knowledge base attached, make sure to place {knowledgeBase}
						where you want the context to be placed.`}
					</li>
					<li className="text-foreground mt-6">
						You can use [brackets] in your script when you want Air to fill in the blank
						with previous conversational context.
					</li>
					<span className="text-sm">
						{`Ex: “Tell me more about [insert the problem the prospect just stated here].”`}
					</span>
					<br />
					<span className="clear-both text-sm">
						{`
					***But it is important you test this thoroughly via testing your AI to make
					sure the way you worded it doesn't cause the AI to say what's in the brackets
					outloud.`}
					</span>
				</ul>
			</>
		),
	},
	{
		title: 'Final Tips',
		content: (
			<>
				<span>
					To diminish the effect of any latency add this line somewhere near the beginning
					of your script:
				</span>
				<div className="bg-foreground/5 my-3 rounded-sm p-3">
					<span className="text-foreground mr-3">
						{`"and by the way, the audio has been a bit laggy today so if i cut you off or
					if there's a bit of a delay I apologize in advance"`}
					</span>
					<CopyButton
						copyContent={`and by the way, the audio has been a bit laggy today so if i cut you off or
					if there's a bit of a delay I apologize in advance`}
					/>
				</div>
				<span>
					Make sure to test & tweak your script A LOT before getting Air on live calls.
					The magic happens when testing your AI and tweaking it until the details are
					great.
				</span>
			</>
		),
	},
];

export default DefaultStepsContent;
