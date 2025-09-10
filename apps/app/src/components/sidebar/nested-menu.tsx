import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { useMediaQuery } from 'usehooks-ts';
import { HeaderIcons } from '../header-icons';
import { useSidebar } from '../providers/sidebar-provider';
import { RawMenuData, RawMenuItem } from './nested-menu-data';

interface MenuItem extends RawMenuItem {
	id: string;
	children?: MenuItem[];
	selected?: boolean;
}

interface NestedMenuProps {
	initialSelectedId?: string;
}

const generateIds = (menuItems: RawMenuItem[], parentId?: string): MenuItem[] => {
	return menuItems.map((item, index) => {
		const id = `${parentId ? `${parentId}-` : ''}${index + 1}`;
		return {
			...item,
			id,
			children: item?.children
				? generateIds(item.children.filter(Boolean) as RawMenuItem[], id)
				: undefined,
		} as MenuItem;
	});
};

const findAncestors = (data: MenuItem[], id: string): string[] => {
	let stack: {
		node: MenuItem;
		path: string[];
	}[] = data.map((node) => ({
		node,
		path: [],
	}));

	while (stack.length) {
		const { node, path } = stack.pop()!;

		// If id is found return the path
		if (node.id === id) {
			return [...path, node.id];
		}

		// Append children to the stack.
		if (node.children) {
			stack = [
				...stack,
				...node.children.map((child) => ({
					node: child,
					path: [...path, node.id],
				})),
			];
		}
	}
	// Return empty array if id is not found
	return [];
};

const findHrefInMenuData = (
	menuItems: MenuItem[],
	pathname: string,
): string | undefined => {
	for (const menuItem of menuItems) {
		// Only check for exact matches.
		if (menuItem.href && pathname === menuItem.href) {
			return menuItem.id;
		}
		if (menuItem.children) {
			const found = findHrefInMenuData(menuItem.children, pathname);
			// If an exact match is found in children, return it.
			if (found) {
				return found;
			}
		}
	}

	// Separate loop to check for prefix matches only if no exact match was found.
	for (const menuItem of menuItems) {
		if (menuItem.href && pathname.startsWith(menuItem.href)) {
			return menuItem.id;
		}
		if (menuItem.children) {
			const found = findHrefInMenuData(menuItem.children, pathname);
			// If a prefix match is found in children, return it.
			if (found) {
				return found;
			}
		}
	}

	// Not found.
	return undefined;
};

const MenuItem: React.FC<{
	item: MenuItem;
	isNested?: boolean;
	parentId?: string;
	selectedItems: string[];
	setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
}> = ({ item, parentId, selectedItems, setSelectedItems, isNested = false }) => {
	const { sidebarVisible, setSidebarVisible } = useSidebar();

	const isMobile = useMediaQuery('(max-width: 640px)');

	const handleItemClick = (itemId: string, hasChildren: boolean) => {
		setSelectedItems((oldItems) => {
			// Create a new array by filtering out sibling items
			const updatedItems = oldItems.filter((item) => {
				return itemId.startsWith(item) || item === parentId;
			});
			// Check if the new item and parentId are not already in the array
			if (!updatedItems.includes(itemId)) {
				updatedItems.push(itemId);
			}
			if (parentId && !updatedItems.includes(parentId)) {
				updatedItems.push(parentId);
			}

			return updatedItems.sort();
		});

		if (hasChildren) {
			setSidebarVisible(true);
		} else if (isMobile) {
			setSidebarVisible(false);
		}
		console.log('isMobile>>>>>', isMobile);
	};

	const isSelected = selectedItems.includes(item.id);
	const isLastSelected = item.id === selectedItems[selectedItems.length - 1];
	// const isFirstSelected = selectedItems.indexOf(item.id) !== 0;

	const Tag = item.href ? Link : 'div';

	return (
		<>
			<Tag
				key={item.id}
				className={`group flex w-full cursor-pointer items-center   
        ${isSelected ? 'selected' : ''}
        `}
				onClick={() => handleItemClick(item.id, Boolean(item.children))}
				href={item.href ?? ''}>
				{/* ICON WRAPPER */}
				<div className="flex w-16 flex-shrink-0 items-center justify-center">
					<div
						className={`w-[36px] rounded-full  ${
							item.icon
								? `
								from-foreground/20
							bg-size-200
							bg-pos-0
							highlight-white/10
							group-hover:bg-pos-50
							group-hover:highlight-white/30
						
							group-[.selected]:bg-pos-100
							group-[.selected]:highlight-white/30
							h-[36px]  
							bg-gradient-to-br 
							via-transparent		
							transition-all
							duration-500
							${item.gradient}
              `
								: 'h-[24px] bg-transparent'
						}`}>
						{item.icon ? (
							item.icon
						) : (
							<HeaderIcons.chevron
								className={`h-[24px] w-[36px] flex-shrink-0 transition-all duration-200 ${
									isSelected && 'rotate-90'
								} ${item.children ? 'opacity-100' : 'opacity-0'} `}
							/>
						)}
					</div>
				</div>

				{/* TEXT */}
				{sidebarVisible && (
					<div
						className={`group-hover:text-foreground line-clamp-1 flex flex-grow basis-0 flex-row items-center whitespace-nowrap font-semibold transition-colors lg:text-sm
            ${isNested ? 'text-base dark:text-slate-600' : ''}
            ${isSelected ? 'text-slate-700 dark:text-white' : ''}
            ${isLastSelected ? 'text-slate-900 dark:text-slate-300' : ''}            
            `}>
						<span>{item.label}</span>
					</div>
				)}
			</Tag>
			{isSelected &&
				sidebarVisible &&
				item.children
					?.filter((v) => v)
					.map((child) => (
						<MenuItem
							item={child}
							parentId={item.id}
							key={child.id}
							isNested
							selectedItems={selectedItems}
							setSelectedItems={setSelectedItems}
						/>
					))}
		</>
	);
};

const NestedMenu: React.FC<NestedMenuProps> = () => {
	const menuDataWithIds = generateIds(RawMenuData());

	const pathname = usePathname();
	const initialSelectedId = findHrefInMenuData(menuDataWithIds, pathname);

	const initialParentIds =
		typeof initialSelectedId !== 'undefined'
			? findAncestors(menuDataWithIds, initialSelectedId)
			: [];

	const [selectedItems, setSelectedItems] = React.useState<string[]>(initialParentIds);

	return (
		<>
			<div className="flex w-full flex-col gap-2">
				{menuDataWithIds.filter(Boolean).map((item) =>
					item.animateIn ? (
						<AnimatePresence key={item.id}>
							<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
								<MenuItem
									item={item}
									selectedItems={selectedItems}
									setSelectedItems={setSelectedItems}
								/>
							</motion.div>
						</AnimatePresence>
					) : (
						<MenuItem
							item={item}
							key={item.id}
							selectedItems={selectedItems}
							setSelectedItems={setSelectedItems}
						/>
					),
				)}
			</div>

			{/* ONLY FOR DEBUG SHOW SELECTED ITEM */}
			{/* <div className=" flex-row">
				{selectedItems.map((selectedItem, index) => (
					<div className="m-2 bg-blue-200" key={index}>
						{selectedItem}
					</div>
				))}
			</div> */}
		</>
	);
};

export default NestedMenu;
