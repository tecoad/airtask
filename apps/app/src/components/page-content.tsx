import { cn } from '@/lib/utils';
import { Title } from './title';

interface topbarProps {
	title?: string;
	content?: React.ReactNode;
}

interface headingProps {
	title: string;
	subtitle?: string;
	separator?: boolean;
	horizontal?: boolean;
}

interface Props {
	topbar?: topbarProps;
	heading?: headingProps;
	children?: React.ReactNode;
	centered?: boolean;
}

export default function PageContent({ children, topbar, heading, centered }: Props) {
	return (
		<div className="flex flex-grow flex-col">
			<title>{heading?.title || topbar?.title || 'Airtask'}</title>

			{topbar && (
				<div className="flex h-16 items-center justify-between gap-4 border-b px-3 md:justify-start md:px-10">
					{topbar.title && (
						<h2 className="text-foreground line-clamp-2 text-xl font-bold leading-5 tracking-tight">
							{topbar.title}
						</h2>
					)}
					{topbar.content}
				</div>
			)}

			{children && (
				<div
					className={cn('relative flex flex-grow flex-col space-y-4  p-3 md:p-10', {
						'items-center justify-center': centered,
					})}>
					{heading && (
						<Title
							title={heading.title}
							subtitle={heading.subtitle}
							separator={heading.separator}
							horizontal={heading.horizontal}
						/>
					)}

					{children}
				</div>
			)}
		</div>
	);
}
