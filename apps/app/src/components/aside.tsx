import { SidebarNav, SidebarNavProps } from './sidebar-nav';

interface Props extends SidebarNavProps {
	className?: string;
}

export const Aside = ({ items, className }: Props) => {
	return (
		<aside
			className={`no-scrollbar -mx-3 flex flex-shrink-0  overflow-x-scroll  lg:-mx-4 lg:block lg:w-1/5 ${className}`}>
			<div className="w-5 flex-shrink-0 lg:hidden"></div>
			<SidebarNav items={items} />
			<div className="w-5 flex-shrink-0 lg:hidden"></div>
		</aside>
	);
};
